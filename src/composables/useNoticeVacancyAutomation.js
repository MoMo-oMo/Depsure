import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Composable for automating notice and vacancy transitions
 * Handles automatic status updates when vacate dates pass
 */
export function useNoticeVacancyAutomation() {
  /**
   * Check all active notices and update statuses if vacate date has passed
   */
  const processExpiredNotices = async () => {
    try {
      console.log("[Automation] Starting expired notices check...");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all active notices
      const noticesRef = collection(db, "notices");
      const activeNoticesQuery = query(
        noticesRef,
        where("status", "==", "Active")
      );
      const noticesSnapshot = await getDocs(activeNoticesQuery);

      const updates = [];

      for (const noticeDoc of noticesSnapshot.docs) {
        const notice = noticeDoc.data();

        // Parse vacate date
        let vacateDate = null;
        if (notice.vacateDate) {
          if (typeof notice.vacateDate.toDate === "function") {
            vacateDate = notice.vacateDate.toDate();
          } else {
            vacateDate = new Date(notice.vacateDate);
          }
          vacateDate.setHours(0, 0, 0, 0);
        }

        // Check if vacate date has passed
        if (vacateDate && vacateDate < today) {
          console.log(
            `[Automation] Notice ${noticeDoc.id} for unit ${notice.unitName} has expired vacate date`
          );

          updates.push({
            noticeId: noticeDoc.id,
            notice,
            vacateDate,
          });
        }
      }

      // Process each expired notice
      for (const { noticeId, notice, vacateDate } of updates) {
        await processExpiredNotice(noticeId, notice, vacateDate);
      }

      console.log(`[Automation] Processed ${updates.length} expired notices`);
      return updates.length;
    } catch (error) {
      console.error("[Automation] Error processing expired notices:", error);
      throw error;
    }
  };

  /**
   * Process a single expired notice
   */
  const processExpiredNotice = async (noticeId, notice, vacateDate) => {
    try {
      console.log(
        `[Automation] Processing expired notice ${noticeId} for unit ${notice.unitName}`
      );

      // 1. Update notice status to Completed
      await updateDoc(doc(db, "notices", noticeId), {
        status: "Completed",
        completedAt: new Date(),
        updatedAt: serverTimestamp(),
      });
      console.log(
        `[Automation] Updated notice ${noticeId} status to Completed`
      );

      // 2. Check if unit still exists in active units
      let unitExists = false;
      let unitData = null;
      let unitDocId = null;

      if (notice.unitId) {
        try {
          const unitDoc = await getDocs(
            query(
              collection(db, "units"),
              where("__name__", "==", notice.unitId)
            )
          );
          if (!unitDoc.empty) {
            unitExists = true;
            unitData = unitDoc.docs[0].data();
            unitDocId = unitDoc.docs[0].id;
          }
        } catch (e) {
          console.log(
            `[Automation] Unit ${notice.unitId} not found in active units`
          );
        }
      }

      // If unit doesn't exist, try to find by unit name
      if (!unitExists && notice.unitName) {
        try {
          const unitsByName = await getDocs(
            query(
              collection(db, "units"),
              where("propertyName", "==", notice.unitName)
            )
          );
          if (!unitsByName.empty) {
            unitExists = true;
            unitData = unitsByName.docs[0].data();
            unitDocId = unitsByName.docs[0].id;
          }
        } catch (e) {
          console.log(`[Automation] Unit ${notice.unitName} not found by name`);
        }
      }

      // 3. If unit exists, create vacancy and update unit status (keep in active units)
      if (unitExists && unitDocId) {
        console.log(`[Automation] Unit ${unitDocId} found, creating vacancy`);

        // Check if vacancy already exists
        const existingVacanciesQuery = query(
          collection(db, "vacancies"),
          where("unitId", "==", unitDocId)
        );
        const existingVacancies = await getDocs(existingVacanciesQuery);

        if (existingVacancies.empty) {
          // Create vacancy entry
          const vacancyData = {
            // Keep all unit information
            agencyId: notice.agencyId || unitData?.agencyId || "",
            unitId: unitDocId,
            unitName: notice.unitName || unitData?.propertyName || "",
            unitNumber: unitData?.unitNumber || "",
            tenantRef: unitData?.tenantRef || "",
            propertyType:
              notice.propertyType || unitData?.propertyType || "residential",
            propertyManager: unitData?.propertyManager || "",
            contactNumber: unitData?.contactNumber || "",
            newOccupation: unitData?.newOccupation || "",
            contractorRequested: unitData?.contractorRequested || "",
            maintenanceAmount: unitData?.maintenanceAmount || 0,
            monthsMissed: unitData?.monthsMissed || 0,

            // Vacancy specific dates
            dateVacated: vacateDate.toISOString().slice(0, 10),
            leaseStartDate: (() => {
              const lsd = notice.leaseStartDate || unitData?.leaseStartDate;
              if (!lsd) return "";
              if (typeof lsd === "string") return lsd;
              if (lsd instanceof Date) return lsd.toISOString().slice(0, 10);
              if (lsd?.toDate) return lsd.toDate().toISOString().slice(0, 10);
              return "";
            })(),
            moveInDate: null,

            // Fields that should be EMPTY initially (as per user request)
            leaseEndDate: "", // Empty - for new tenant
            paidTowardsFund: 0, // Empty
            amountToBePaidOut: 0, // Empty
            newTenantRef: "", // Empty - for new tenant
            notes: "", // Empty
            paidOut: "", // Empty

            // System fields
            status: "Available",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await addDoc(collection(db, "vacancies"), vacancyData);
          console.log(`[Automation] Created vacancy for unit ${unitDocId}`);
        } else {
          console.log(
            `[Automation] Vacancy already exists for unit ${unitDocId}`
          );
        }

        // Update unit status (keep it in active units, don't archive)
        await updateDoc(doc(db, "units", unitDocId), {
          status: "Vacancy Created",
          vacancyCreatedAt: new Date(),
          noticeId: null, // Clear the notice reference
          updatedAt: new Date(),
        });
        console.log(
          `[Automation] Updated unit ${unitDocId} status to 'Vacancy Created' - kept in active units`
        );
      } else {
        console.log(
          `[Automation] Unit for notice ${noticeId} not found in active units, skipping vacancy creation`
        );
      }
    } catch (error) {
      console.error(
        `[Automation] Error processing expired notice ${noticeId}:`,
        error
      );
      throw error;
    }
  };

  /**
   * Run all automation checks
   */
  const runAutomation = async () => {
    try {
      console.log("[Automation] Starting automation run...");
      const startTime = Date.now();

      const expiredCount = await processExpiredNotices();

      const duration = Date.now() - startTime;
      console.log(
        `[Automation] Automation run completed in ${duration}ms. Processed ${expiredCount} expired notices.`
      );

      return {
        success: true,
        expiredNoticesProcessed: expiredCount,
        duration,
      };
    } catch (error) {
      console.error("[Automation] Automation run failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  return {
    processExpiredNotices,
    processExpiredNotice,
    runAutomation,
  };
}






