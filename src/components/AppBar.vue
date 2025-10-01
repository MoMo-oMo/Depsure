<template>
	<v-app-bar
		app
		color="#ffffff"
		theme="light"
		flat
		density="comfortable"
		class="app-bar"
	>
		<v-app-bar-nav-icon color="black" @click="toggle" />
		<v-toolbar-title class="title-black">
			<span class="title-text" :key="current.title">{{ current.title }}</span>
		</v-toolbar-title>
		<v-spacer />
		<!-- Chat Icon with Notification Badge -->
		<v-btn
			icon
			color="black"
			@click="openChat"
			class="chat-btn"
			:title="unreadCount > 0 ? `${unreadCount} unread messages` : 'Chat'"
		>
			<v-badge
				:content="unreadCount"
				:model-value="unreadCount > 0"
				color="error"
				overlap
			>
				<v-icon>mdi-message-text</v-icon>
			</v-badge>
		</v-btn>
	</v-app-bar>
</template>

<script setup>
	import { ref, onMounted, onUnmounted } from 'vue'
	import { useRouter } from 'vue-router'
	import { useDrawer } from '@/composables/useDrawer'
	import { useNav } from '@/composables/useNav'
	import { db } from '@/firebaseConfig'
	import { collection, query, where, onSnapshot } from 'firebase/firestore'
	import { useAppStore } from '@/stores/app'

	const { toggle } = useDrawer()
	const { current } = useNav()
	const router = useRouter()
	const appStore = useAppStore()
	
	const unreadCount = ref(0)
	let unsubscribe = null

	const openChat = () => {
		router.push('/chat')
	}

	const subscribeToChats = () => {
		try {
			const user = appStore.currentUser
			if (!user) return

			let chatQuery
			
			if (user.userType === 'Agency' || (user.userType === 'Admin' && user.adminScope === 'agency')) {
				// Agency users see their own chat
				const agencyId = user.userType === 'Agency' ? user.uid : user.managedAgencyId
				chatQuery = query(
					collection(db, 'chats'),
					where('agencyId', '==', agencyId)
				)
			} else {
				// Admin/Super Admin see all chats
				chatQuery = collection(db, 'chats')
			}

			unsubscribe = onSnapshot(chatQuery, (snapshot) => {
				let count = 0
				const userId = user.uid
				snapshot.docs.forEach(doc => {
					const data = doc.data()
					const messages = data.messages || []
					// Count unread messages (where current user is not the author and message is not read)
					messages.forEach(msg => {
						if (msg.authorId !== userId && !msg.readBy?.includes(userId)) {
							count++
						}
					})
				})
				unreadCount.value = count
			})
		} catch (error) {
			console.error('Error subscribing to chats:', error)
		}
	}

	onMounted(() => {
		subscribeToChats()
	})

	onUnmounted(() => {
		if (unsubscribe) unsubscribe()
	})
</script>

<style scoped>
.title-black :deep(.v-toolbar-title__placeholder) {
	color: #000000;
}

.title-text {
	position: relative;
	font-weight: 600;
    border-radius:20px;
	line-height: 1.1;
	padding-bottom: 10px;
	display: inline-block;
}

.title-text::after {
	content: "";
	position: absolute;
	left: 0;
	bottom: 0;
	height: 4px;
	width: 100%;
	background-color: #000000;
	transform: scaleX(0);
	transform-origin: left center;
	animation: underline-in 400ms ease forwards;
}

@keyframes underline-in {
	from { transform: scaleX(0); }
	to { transform: scaleX(1); }
}

.app-bar {
	position: sticky;
	top: 0;
	z-index: 1000;
}

.chat-btn {
	margin-right: 8px;
	transition: all 0.3s ease;
}

.chat-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.title-text {
		font-size: 0.9rem;
	}
	
	.chat-btn {
		margin-right: 4px;
	}
}
</style>