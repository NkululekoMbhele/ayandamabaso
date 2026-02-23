<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-svelte';

  // Get order number from URL
  const orderNumber = $derived($page.url.searchParams.get('order') || '');
</script>

<svelte:head>
  <title>Payment Cancelled - Ayanda Mabaso</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-2xl mx-auto text-center">
      <!-- Cancelled Icon -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
          <XCircle class="h-12 w-12 text-orange-600" />
        </div>
      </div>

      <!-- Cancelled Message -->
      <h1 class="text-4xl font-bold text-foreground mb-4">
        Payment Cancelled
      </h1>
      <p class="text-lg text-muted-foreground mb-8">
        Your payment was not completed. Don't worry - your cart items are still saved.
      </p>

      {#if orderNumber}
        <Card.Root class="mb-8">
          <Card.Content class="pt-6">
            <div class="text-center">
              <p class="text-sm text-muted-foreground mb-1">Order Reference</p>
              <p class="text-xl font-mono font-medium text-muted-foreground">{orderNumber}</p>
              <p class="text-sm text-orange-600 mt-2">Payment pending</p>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}

      <!-- What You Can Do -->
      <Card.Root class="mb-8 text-left">
        <Card.Header>
          <Card.Title>What would you like to do?</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="flex items-start gap-4">
            <div class="p-2 bg-primary/10 rounded-lg">
              <RefreshCw class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-semibold">Try Again</h4>
              <p class="text-sm text-muted-foreground">
                Return to your cart and try the checkout process again with a different payment method.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="p-2 bg-primary/10 rounded-lg">
              <HelpCircle class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-semibold">Need Help?</h4>
              <p class="text-sm text-muted-foreground">
                If you experienced any issues during checkout, please contact us and we'll assist you.
              </p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Common Reasons -->
      <Card.Root class="mb-8 text-left bg-muted/50">
        <Card.Header>
          <Card.Title class="text-base">Common reasons for payment cancellation:</Card.Title>
        </Card.Header>
        <Card.Content>
          <ul class="text-sm text-muted-foreground space-y-2">
            <li>- You clicked "Cancel" on the payment page</li>
            <li>- Your bank declined the transaction</li>
            <li>- The payment session timed out</li>
            <li>- There was a network interruption</li>
          </ul>
        </Card.Content>
      </Card.Root>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onclick={() => goto('/cart')}
          class="bg-primary hover:bg-primary/90 px-8"
        >
          <ArrowLeft class="h-4 w-4 mr-2" />
          Return to Cart
        </Button>
        <Button
          onclick={() => goto('/store')}
          variant="outline"
          class="px-8"
        >
          Continue Shopping
        </Button>
      </div>

      <!-- Contact -->
      <p class="mt-8 text-sm text-muted-foreground">
        Need assistance? Contact us at{' '}
        <a href="mailto:biz@mabasomedia.co.za" class="text-primary hover:underline">
          biz@mabasomedia.co.za
        </a>
      </p>
    </div>
  </div>
</div>
