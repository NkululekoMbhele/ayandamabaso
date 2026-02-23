<script lang="ts">
	import { Calendar as CalendarPrimitive } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { Calendar as CalendarIcon } from 'lucide-svelte';
	import { formatDate } from '$lib/utils/date';
	import { CalendarDate, type DateValue } from '@internationalized/date';

	interface Props {
		selectedDate: Date | null;
		onDateChange: (date: Date) => void;
		minDate: Date;
		maxDate: Date;
	}

	let { selectedDate, onDateChange, minDate, maxDate }: Props = $props();

	let datePickerOpen = $state(false);

	// Convert Date to CalendarDate for calendar component
	const minCalendarDate = $derived(
		new CalendarDate(minDate.getFullYear(), minDate.getMonth() + 1, minDate.getDate())
	);

	const maxCalendarDate = $derived(
		new CalendarDate(maxDate.getFullYear(), maxDate.getMonth() + 1, maxDate.getDate())
	);

	const selectedCalendarDate = $derived(
		selectedDate
			? new CalendarDate(
					selectedDate.getFullYear(),
					selectedDate.getMonth() + 1,
					selectedDate.getDate()
				)
			: undefined
	);

	function handleDateSelect(value: DateValue | undefined) {
		if (value) {
			const jsDate = new Date(value.year, value.month - 1, value.day);
			onDateChange(jsDate);
			datePickerOpen = false;
		}
	}

	function isDateUnavailable(date: DateValue): boolean {
		// Disable if before min date or after max date
		if (date.compare(minCalendarDate) < 0 || date.compare(maxCalendarDate) > 0) {
			return true;
		}
		return false;
	}
</script>

<div class="space-y-8">
	<div class="text-center">
		<h2 class="text-3xl font-bold text-foreground mb-3">Select Your Consultation Date</h2>
		<p class="text-muted-foreground">
			Choose your preferred date. We'll arrange the specific time via email.
		</p>
	</div>

	<!-- Date Selection -->
	<div class="max-w-md mx-auto">
		<label class="block text-sm font-medium text-foreground mb-3">
			<div class="flex items-center gap-2">
				<CalendarIcon class="w-4 h-4" />
				<span>Select Date</span>
			</div>
		</label>

		<Popover.Root bind:open={datePickerOpen}>
			<Popover.Trigger
				class="w-full flex items-center justify-start text-left font-normal h-14 text-base border-2 hover:border-primary transition-colors rounded-md bg-background px-4 py-2 border-input"
			>
				<CalendarIcon class="mr-3 h-5 w-5 text-muted-foreground" />
				{#if selectedDate}
					{formatDate(selectedDate, 'long')}
				{:else}
					<span class="text-muted-foreground">Pick a date</span>
				{/if}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0" align="start">
				<CalendarPrimitive
					type="single"
					value={selectedCalendarDate}
					onValueChange={handleDateSelect}
					minValue={minCalendarDate}
					maxValue={maxCalendarDate}
					isDateUnavailable={isDateUnavailable}
					initialFocus
					numberOfMonths={1}
					weekStartsOn={1}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>

	<!-- Selected Date Summary -->
	{#if selectedDate}
		<div class="max-w-md mx-auto bg-primary/5 border border-primary/20 rounded-xl p-6">
			<h3 class="text-sm font-semibold text-foreground mb-3 text-center">Your Selected Date</h3>
			<div class="text-center">
				<div class="text-3xl font-bold text-primary">{formatDate(selectedDate, 'short')}</div>
				<div class="text-sm text-muted-foreground mt-2">
					{selectedDate.toLocaleDateString('en-ZA', { weekday: 'long' })}
				</div>
			</div>
			<div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
				<p class="text-xs text-blue-800">
					✓ We'll contact you within 24 hours to confirm the specific time and any other details.
				</p>
			</div>
		</div>
	{/if}
</div>
