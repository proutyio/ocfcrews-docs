---
sidebar_position: 4
title: "Checkout Flow"
---

# Checkout Flow

The checkout process guides users from their cart through address collection, payment, and order confirmation. It is implemented across two route pages and several client components.

## Checkout Architecture

```
/checkout              -> CheckoutPage component
/checkout/confirm-order -> ConfirmOrder component
```

## Step-by-Step Flow

### 1. Cart Review

The checkout page begins by reviewing the cart contents. If the cart is empty, users see an "Your cart is empty" message with a link to continue shopping.

The cart summary panel (right side on desktop) displays:

- Product images (with variant-specific images when applicable)
- Product titles and variant labels
- Quantities
- Per-item prices
- Cart subtotal

### 2. Contact Information

**Authenticated users**: Their email is displayed with a "Not you? Log out" option.

**Guest users**: Two options are presented:

- Log in or create an account via buttons linking to `/login` and `/create-account`
- Enter an email address to continue as a guest

### 3. Address Collection

**Source**: `src/components/Shop/checkout/CheckoutPage.tsx`, `src/components/Shop/checkout/CheckoutAddresses.tsx`

#### Billing Address

For authenticated users, the `CheckoutAddresses` component presents their saved addresses. For guests, a `CreateAddressModal` allows entering a new address inline.

#### Shipping Address

By default, shipping is the same as billing (controlled by a checkbox). When unchecked, a separate shipping address section appears with the same options.

Existing addresses can be selected or removed before payment. Once payment data is received, the address removal buttons are disabled.

### 4. Payment Initiation

When the user clicks **"Go to payment"**, the `initiatePayment` function is called:

```typescript
const paymentData = await initiatePayment('stripe', {
  additionalData: {
    customerEmail: email,
    billingAddress,
    shippingAddress: billingAddressSameAsShipping ? billingAddress : shippingAddress,
  },
})
```

The button is disabled until all required information is provided: email (or authenticated user), billing address, and optionally a separate shipping address.

### 5. Stripe Payment Form

Once a `clientSecret` is returned from the server, the Stripe Elements form is rendered:

```typescript
<Elements options={{ clientSecret, appearance: { ... } }} stripe={stripe}>
  <CheckoutForm
    customerEmail={email}
    billingAddress={billingAddress}
    setProcessingPayment={setProcessingPayment}
  />
</Elements>
```

The `CheckoutForm` component handles:

- Rendering the Stripe Payment Element
- Processing the payment submission
- Handling errors
- Redirecting to the confirmation page on success

A "Cancel payment" button allows the user to go back and modify their details.

### 6. Order Confirmation

**Source**: `src/components/Shop/checkout/ConfirmOrder.tsx`

After Stripe processes the payment, the user is redirected to `/checkout/confirm-order` with a `payment_intent` query parameter.

The `ConfirmOrder` component:

1. Reads the `payment_intent` and `email` from URL search params
2. Calls `confirmOrder('stripe', { additionalData: { paymentIntentID } })` to finalize the order on the server
3. Uses a `ref` to ensure the confirmation only runs once, even if the component re-renders
4. On success, redirects to `/shop/order/{orderID}?email={email}`
5. On failure, shows an error toast and redirects to `/shop`

```typescript
confirmOrder('stripe', {
  additionalData: { paymentIntentID },
}).then((result) => {
  if (result && typeof result === 'object' && 'orderID' in result && result.orderID) {
    router.push(`/shop/order/${result.orderID}?email=${encodeURIComponent(email ?? '')}`)
  }
}).catch((err) => {
  toast.error('Failed to confirm order. Please contact support.')
  router.push('/shop')
})
```

While confirmation is processing, a loading spinner is displayed.

## Error Handling

The checkout flow handles several error scenarios:

| Scenario | Behavior |
|----------|----------|
| Empty cart | Shows "Your cart is empty" with link to continue shopping |
| Out of stock | Displays "One or more items in your cart are out of stock" error |
| Payment initiation failure | Shows error message with "Try again" button |
| Payment processing | Shows "Processing your payment..." with spinner |
| Confirmation failure | Toast error and redirect to shop |
| Missing payment intent | Redirect to home page |

## Client-Side Hooks

The checkout components use several hooks from `@payloadcms/plugin-ecommerce/client/react`:

| Hook | Purpose |
|------|---------|
| `useCart()` | Access cart state (items, subtotal) |
| `usePayments()` | Access `initiatePayment` and `confirmOrder` functions |
| `useAddresses()` | Access saved customer addresses |

## Theme Integration

The Stripe Elements form adapts to the current light/dark theme via the `useTheme()` hook, ensuring the payment form visually matches the rest of the application.
