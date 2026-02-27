<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { CheckCircle, Package, Mail, ArrowRight, Download } from 'lucide-svelte';
  import QualifyingQuestionsForm from '$lib/components/checkout/QualifyingQuestionsForm.svelte';
  import { cartStore } from '$lib/stores/cart.svelte';

  // Get order number from URL
  const orderNumber = $derived($page.url.searchParams.get('order') || '');

  let questionsCompleted = $state(false);

  // Clear cart after successful payment
  onMount(() => {
    cartStore.reset();
  });

  function handleQuestionsComplete() {
    questionsCompleted = true;
  }
</script>

<svelte:head>
  <title>Order Confirmed - Ayanda Mabaso</title>
</svelte:head>

{#if !questionsCompleted && orderNumber}
  <QualifyingQuestionsForm {orderNumber} onComplete={handleQuestionsComplete} />
{:else}
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="max-w-2xl mx-auto text-center">
      <!-- Success Icon -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle class="h-12 w-12 text-green-600" />
        </div>
      </div>

      <!-- Success Message -->
      <h1 class="text-4xl font-bold text-foreground mb-4">
        Thank You for Your Order!
      </h1>
      <p class="text-lg text-muted-foreground mb-8">
        Your payment has been processed successfully.
      </p>

      {#if orderNumber}
        <Card.Root class="mb-8">
          <Card.Content class="pt-6">
            <div class="text-center">
              <p class="text-sm text-muted-foreground mb-1">Order Number</p>
              <p class="text-2xl font-mono font-bold text-primary">{orderNumber}</p>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}

      <!-- What's Next -->
      <Card.Root class="mb-8 text-left">
        <Card.Header>
          <Card.Title>What happens next?</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="flex items-start gap-4">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Mail class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-semibold">Confirmation Email</h4>
              <p class="text-sm text-muted-foreground">
                You'll receive an order confirmation email with your receipt and order details.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Download class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-semibold">Digital Products</h4>
              <p class="text-sm text-muted-foreground">
                If your order includes digital products (ebooks, guides), download links will be in your confirmation email.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="p-2 bg-primary/10 rounded-lg">
              <Package class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-semibold">Physical Products</h4>
              <p class="text-sm text-muted-foreground">
                For physical products, you'll receive tracking information once your order ships.
              </p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onclick={() => goto('/store')}
          variant="outline"
          class="px-8"
        >
          Continue Shopping
        </Button>
        <Button
          onclick={() => goto('/dashboard/orders')}
          class="bg-primary hover:bg-primary/90 px-8"
        >
          View My Orders
          <ArrowRight class="h-4 w-4 ml-2" />
        </Button>
      </div>

        <!-- Contact -->
        <p class="mt-8 text-sm text-muted-foreground">
          Have questions? Contact us at{' '}
          <a href="mailto:biz@mabasomedia.co.za" class="text-primary hover:underline">
            biz@mabasomedia.co.za
          </a>
        </p>
      </div>
    </div>
  </div>
{/if}
