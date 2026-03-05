import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import ApiService from "../../services/ApiService";
import { useError } from "../common/ErrorDisplay";


// Stripe publishable key
const stripeInstance = loadStripe(
  "pk_test_51T5A63FbLM4MA2hZsU4FkfXnnd08M84gGsyvaTRwcPMvKZ89UOGPcbSKfOUsM9hEaunnAzvnEccZ6gDGmCQDcCG900bnFWPZDL"
);



/* ============================
   PAYMENT FORM
============================ */

const PaymentForm = ({ amount, orderId, onSuccess }) => {

  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);

  const { ErrorDisplay, showError } = useError();

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {

      // STEP 1: Ask backend to initialize payment
      const body = {
        amount: amount,
        orderId: orderId,
      };

      const paymentInitResponse = await ApiService.proceedForPayment(body);

      if (paymentInitResponse.statusCode !== 200) {
        throw new Error(
          paymentInitResponse.message || "Failed to initialize payment"
        );
      }

      const clientSecret = paymentInitResponse.data;


      // STEP 2: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        throw error;
      }


      // STEP 3: Update backend payment status
      if (paymentIntent.status === "succeeded") {

        await ApiService.updateOrderPayment({
          orderId,
          amount,
          transactionId: paymentIntent.id,
          success: true,
        });

        onSuccess(paymentIntent);

      } else {

        await ApiService.updateOrderPayment({
          orderId,
          amount,
          transactionId: paymentIntent.id,
          success: false,
        });

      }

    } catch (error) {

      console.log("Payment Error:", error);
      showError(error.message);

    } finally {

      setLoading(false);

    }
  };



  return (
    <form onSubmit={handleSubmit} className="payment-form">

      <ErrorDisplay />

      <div className="form-group">
        <CardElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="pay-button"
      >
        {loading ? "Processing..." : `Pay $${amount}`}
      </button>

    </form>
  );
};



/* ============================
   MAIN PAYMENT PAGE
============================ */

const Payment = () => {

  const location = useLocation();
  const navigate = useNavigate();


  // Read query parameters
  const { orderId, amount } = useMemo(() => {

    const params = new URLSearchParams(location.search);

    const orderIdParam = params.get("orderid") || params.get("orderId");
    const amountParam = params.get("amount");

    return {
      orderId: orderIdParam ? Number(orderIdParam) : null,
      amount: amountParam ? Number(amountParam) : null,
    };

  }, [location.search]);



  const handleSuccess = () => {

    alert("Payment successful!");

    navigate("/my-order-history");

  };



  if (!orderId || !amount) {

    return (
      <div style={{ padding: "40px" }}>
        <h2>Invalid Payment URL</h2>
        <p>Missing orderId or amount.</p>
      </div>
    );

  }



  return (

    <div className="payment-container">

      <h2>Complete Payment</h2>

      <Elements stripe={stripeInstance}>

        <PaymentForm
          amount={amount}
          orderId={orderId}
          onSuccess={handleSuccess}
        />

      </Elements>

    </div>

  );

};


export default Payment;