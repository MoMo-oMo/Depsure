# Maintenance Management System

## Overview
The maintenance management system has been successfully implemented with full Firebase integration. This system allows property managers to track and manage maintenance requests for their properties.

## Features Implemented

### Add Maintenance Page (`/add-maintenance`)
- **Agency Selection**: Dropdown to select the agency responsible for the maintenance
- **Unit Information**: Unit name, address, and contact details
- **Maintenance Details**: 
  - Notice given status (Yes/No)
  - Vacate date
  - Maintenance status (Pending, In Progress, Completed, Cancelled)
  - Priority level (Low, Medium, High, Urgent)
  - Estimated cost
- **File Upload**: Support for uploading quote instructions (PDF, DOC, DOCX)
- **Additional Notes**: Text area for additional information
- **Form Validation**: Comprehensive validation for all required fields
- **Loading States**: Visual feedback during form submission and file upload

### Maintenance List Page (`/maintenance`)
- **Data Fetching**: Real-time data from Firebase Firestore
- **Search & Filter**: 
  - Text search across unit names
  - Agency filter
  - Month-based filtering
- **Table Display**: 
  - Unit name, notice status, vacate date, contact info
  - Maintenance status and priority
  - Action buttons (View, Edit, Delete)
- **Loading States**: Loading indicators during data fetch
- **Error Handling**: Proper error messages for failed operations

## Firebase Integration

### Firestore Collections
- **`maintenance`**: Stores all maintenance entries
  - Fields: agencyId, unitName, noticeGiven, vacateDate, contactNumber, address, status, priority, estimatedCost, notes, quoteFileURL, quoteFileName, createdAt, updatedAt

### Firebase Storage
- **`maintenance-quotes/`**: Stores uploaded quote instruction files
- Files are named with timestamps to prevent conflicts
- Download URLs are stored in Firestore for easy access

### Security Rules
The system uses Firebase's built-in security rules. Make sure to configure appropriate rules for:
- Firestore: Read/write access for authenticated users
- Storage: Upload/download permissions for maintenance files

## Data Flow

1. **Adding Maintenance**:
   - User fills out the form
   - File is uploaded to Firebase Storage (if provided)
   - Maintenance data is saved to Firestore
   - Success/error feedback is shown
   - User is redirected to maintenance list

2. **Viewing Maintenance**:
   - Data is fetched from Firestore on page load
   - Entries are displayed in a sortable table
   - Filters are applied in real-time
   - Loading states provide user feedback

3. **Deleting Maintenance**:
   - Confirmation dialog is shown
   - Entry is deleted from Firestore
   - Table is updated immediately
   - Success/error feedback is shown

## Error Handling

The system includes comprehensive error handling:
- **Network Errors**: Connection issues when communicating with Firebase
- **Upload Errors**: File upload failures
- **Validation Errors**: Form validation failures
- **Permission Errors**: Firebase security rule violations

All errors are displayed using the application's custom error dialog system.

## Usage Instructions

### For Property Managers:
1. Navigate to the Maintenance page
2. Click "Add Maintenance" to create a new entry
3. Fill in all required fields
4. Upload any relevant documents
5. Submit the form
6. View, edit, or delete entries from the maintenance list

### For Developers:
The maintenance system is fully integrated with the existing codebase:
- Uses existing Firebase configuration
- Follows established patterns for data management
- Integrates with the custom dialog system
- Maintains consistent UI/UX with other pages

## Technical Notes

- **Vue 3 Composition API**: Used for reactive data management
- **Vuetify 3**: UI components and styling
- **Firebase v12**: Latest Firebase SDK with modular imports
- **File Upload**: Supports multiple file types with size validation
- **Real-time Updates**: Data is fetched fresh on each page load
- **Responsive Design**: Works on desktop and mobile devices

## Future Enhancements

Potential improvements for the maintenance system:
- Real-time notifications for status changes
- Email notifications to relevant parties
- Maintenance history tracking
- Cost tracking and reporting
- Integration with calendar systems
- Mobile app support
- Advanced filtering and sorting options
