<script lang="ts">
	import { ha } from '../../domains/ha/store.svelte.ts';
	import { app } from '../../domains/app/store.svelte.ts';
	import type { Device, EventTimerWidget, CustomCardWidget } from '$lib/types';
	import { DeviceType } from '$lib/types';
	import DeviceIcon from '../../domains/ui/DeviceIcon.svelte';
	import AddToTabButton from '../../domains/ui/AddToTabButton.svelte';
	import ConfirmDialog from '../../domains/ui/ConfirmDialog.svelte';
	import { Icon } from 'iconify-svelte';

	let deletingItem = $state<EventTimerWidget | CustomCardWidget | null>(null);

	function handleEdit(widget: CustomCardWidget) {
		const templateId = `custom-card-template-${widget.id}`;
		const template = app.templates.get(templateId);
		if (template) {
			app.setEditingTemplate(template);
		} else {
			// In a real app, you might want a more user-friendly notification
			alert('Шаблон для этой карточки не найден.');
		}
	}

	function handleDelete(item: EventTimerWidget | CustomCardWidget) {
		deletingItem = item;
	}

	function confirmDelete() {
		if (!deletingItem) return;

		if ('cycleDays' in deletingItem) {
			// It's an EventTimerWidget
			app.deleteCustomWidget(deletingItem.id);
		} else {
			// It's a CustomCardWidget
			app.deleteCustomCard(deletingItem.id);
		}
		deletingItem = null;
	}

	function renderHelperRow(device: Device, onTrigger: (id: string) => void) {
		return { device, onTrigger };
	}
</script>

<div class="container mx-auto p-4">
	<div class="flex flex-wrap justify-between items-center gap-4 mb-8">
		<div>
			<h1 class="text-3xl font-bold">Вспомогательные элементы</h1>
			<p class="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">
				Управляйте вашими виджетами, сценами и автоматизациями. Добавляйте их на дашборд для
				быстрого доступа.
			</p>
		</div>
	</div>

	<div class="space-y-10">
		<section>
			<div class="flex flex-wrap justify-between items-center mb-4 gap-2">
				<h2
					class="text-2xl font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700 pb-2 flex-grow"
				>
					Виджеты
				</h2>
				<div class="flex-shrink-0 flex items-center gap-2">
					<button
						onclick={() => app.addCustomCard()}
						class="bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
					>
						<Icon icon="mdi:view-dashboard-plus-outline" class="w-5 h-5" />
						<span>Новая карточка</span>
					</button>
					<button
						onclick={() => app.addCustomWidget()}
						class="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
					>
						<Icon icon="mdi:plus" class="w-5 h-5" />
						<span>Новый таймер</span>
					</button>
				</div>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each [...app.state.eventTimerWidgets, ...app.state.customCardWidgets] as widget (widget.id)}
					{@const isTimer = 'cycleDays' in widget}
					{@const deviceId = isTimer
						? `internal::event-timer_${widget.id}`
						: `internal::custom-card_${widget.id}`}
					{@const device = ha.allKnownDevices.get(deviceId)}
					{@const displayType = isTimer ? DeviceType.EventTimer : DeviceType.Custom}
					{@const displayName = device?.name || widget.name}
					<div
						class="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg flex items-center justify-between ring-1 ring-black/5 dark:ring-white/5"
					>
						<div class="flex items-center gap-4 overflow-hidden">
							<div class="w-8 h-8 flex-shrink-0 text-gray-500 dark:text-gray-400">
								<DeviceIcon icon={displayType} isOn={false} class="!w-full !h-full !m-0" />
							</div>
							<div class="flex-1 overflow-hidden">
								<p class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
									{displayName}
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{isTimer ? 'Виджет-таймер' : 'Кастомная карточка'}
								</p>
							</div>
						</div>
						<div class="flex items-center gap-2 flex-shrink-0">
							<button
								onclick={() => (isTimer ? app.setEditingEventTimerId(widget.id) : handleEdit(widget as CustomCardWidget))}
								class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500"
								title="Настроить"
							>
								<Icon icon="mdi:pencil" class="h-5 w-5" />
							</button>
							<button
								onclick={() => handleDelete(widget)}
								class="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500"
								title="Удалить"
							>
								<Icon icon="mdi:trash-can-outline" class="h-5 w-5" />
							</button>
							{#if device}
								<AddToTabButton onAddToTab={(tabId) => app.handleDeviceAddToTab(device, tabId)} availableTabs={app.state.tabs.filter((tab) => !tab.layout.some((item) => item.deviceId === device.id))} />
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</section>

		{#if ha.allScenes.length > 0}
			<section>
				<h2
					class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2"
				>
					Сцены
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each ha.allScenes as scene (scene.id)}
						<div
							class="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg flex items-center justify-between ring-1 ring-black/5 dark:ring-white/5"
						>
							<div class="flex items-center gap-4 overflow-hidden">
								<div class="w-8 h-8 flex-shrink-0 text-gray-500 dark:text-gray-400">
									<DeviceIcon icon={scene.type} isOn={scene.state === 'on'} class="!w-full !h-full !m-0" />
								</div>
								<div class="flex-1 overflow-hidden">
									<p class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
										{scene.name}
									</p>
									<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{scene.status}</p>
								</div>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<button
									onclick={() => ha.triggerScene(scene.id)}
									class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500"
									title="Запустить"
								>
									<Icon icon="mdi:play" class="h-5 w-5" />
								</button>
								<AddToTabButton onAddToTab={(tabId) => app.handleDeviceAddToTab(scene, tabId)} availableTabs={app.state.tabs.filter((tab) => !tab.layout.some((item) => item.deviceId === scene.id))} />
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if ha.allAutomations.length > 0}
			<section>
				<h2
					class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2"
				>
					Автоматизации
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each ha.allAutomations as automation (automation.id)}
						<div
							class="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg flex items-center justify-between ring-1 ring-black/5 dark:ring-white/5"
						>
							<div class="flex items-center gap-4 overflow-hidden">
								<div class="w-8 h-8 flex-shrink-0 text-gray-500 dark:text-gray-400">
									<DeviceIcon
										icon={automation.type}
										isOn={automation.state === 'on'}
										class="!w-full !h-full !m-0"
									/>
								</div>
								<div class="flex-1 overflow-hidden">
									<p class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
										{automation.name}
									</p>
									<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{automation.status}</p>
								</div>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<button
									onclick={() => ha.triggerAutomation(automation.id)}
									class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500"
									title="Запустить"
								>
									<Icon icon="mdi:play" class="h-5 w-5" />
								</button>
								<AddToTabButton onAddToTab={(tabId) => app.handleDeviceAddToTab(automation, tabId)} availableTabs={app.state.tabs.filter((tab) => !tab.layout.some((item) => item.deviceId === automation.id))} />
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if ha.allScripts.length > 0}
			<section>
				<h2
					class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2"
				>
					Скрипты
				</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each ha.allScripts as script (script.id)}
						<div
							class="bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg flex items-center justify-between ring-1 ring-black/5 dark:ring-white/5"
						>
							<div class="flex items-center gap-4 overflow-hidden">
								<div class="w-8 h-8 flex-shrink-0 text-gray-500 dark:text-gray-400">
									<DeviceIcon icon={script.type} isOn={script.state === 'on'} class="!w-full !h-full !m-0" />
								</div>
								<div class="flex-1 overflow-hidden">
									<p class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
										{script.name}
									</p>
									<p class="text-xs text-gray-500 dark:text-gray-400 truncate">{script.status}</p>
								</div>
							</div>
							<div class="flex items-center gap-2 flex-shrink-0">
								<button
									onclick={() => ha.triggerScript(script.id)}
									class="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500"
									title="Запустить"
								>
									<Icon icon="mdi:play" class="h-5 w-5" />
								</button>
								<AddToTabButton onAddToTab={(tabId) => app.handleDeviceAddToTab(script, tabId)} availableTabs={app.state.tabs.filter((tab) => !tab.layout.some((item) => item.deviceId === script.id))} />
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>

	<ConfirmDialog
		isOpen={deletingItem !== null}
		title="Удалить элемент?"
		message={`Вы уверены, что хотите удалить <strong>"${deletingItem?.name}"</strong>?<br />Это действие нельзя отменить.`}
		onConfirm={confirmDelete}
		onCancel={() => (deletingItem = null)}
		confirmText="Удалить"
	/>
</div>