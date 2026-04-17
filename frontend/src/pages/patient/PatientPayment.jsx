import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { ArrowLeft, CheckCircle2, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { AppointmentService, DoctorService, PaymentService } from '../../services/api';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function PaymentForm({ payment, currentUser, onSuccess, onBack, onStatusChange }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardHolderName, setCardHolderName] = useState(currentUser?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe is still loading. Please try again in a moment.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card details are not ready yet.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      onStatusChange('Confirming payment with Stripe...');

      const result = await stripe.confirmCardPayment(payment.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardHolderName || currentUser?.name || 'Patient',
            email: currentUser?.email || undefined,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Stripe could not confirm the payment');
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        throw new Error(`Payment status: ${result.paymentIntent?.status || 'unknown'}`);
      }

      onStatusChange('Verifying payment...');
      await PaymentService.verifyPayment(payment._id);
      onSuccess();
    } catch (err) {
      setError(err?.message || 'Payment failed');
      onStatusChange('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder name</label>
        <input
          value={cardHolderName}
          onChange={(event) => setCardHolderName(event.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Name on card"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Card details</label>
        <div className="px-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  color: '#0f172a',
                  fontSize: '16px',
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  '::placeholder': {
                    color: '#94a3b8',
                  },
                },
                invalid: {
                  color: '#dc2626',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
        <ShieldCheck className="w-4 h-4 text-accent" />
        Your card is processed securely through Stripe.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={!stripe || submitting}
          className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {submitting ? 'Processing...' : `Confirm and Pay ${payment.amount} ${payment.currency}`}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function PaymentContent() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (!appointmentId) {
        setError('Missing appointment id');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const appointmentResponse = await AppointmentService.getAppointmentById(appointmentId);
        const appointmentData = appointmentResponse?.data || appointmentResponse;
        setAppointment(appointmentData);

        if (appointmentData?.doctorId) {
          const doctorId = typeof appointmentData.doctorId === 'object' ? appointmentData.doctorId._id : appointmentData.doctorId;
          if (doctorId) {
            try {
              const doctorResponse = await DoctorService.getDoctorById(doctorId);
              setDoctor(doctorResponse?.data || doctorResponse);
            } catch {
              setDoctor(null);
            }
          }
        }

        const paymentLookup = await PaymentService.getPaymentByAppointment(appointmentId);
        const paymentRecord = paymentLookup?.data || paymentLookup;

        if (paymentRecord) {
          setPayment(paymentRecord);
          setCompleted((paymentRecord.status || '').toLowerCase() === 'completed');
          if ((paymentRecord.status || '').toLowerCase() === 'completed') {
            setStatusMessage('This appointment is already paid.');
            return;
          }
        }

        if (!paymentRecord || !(paymentRecord.clientSecret || paymentRecord.stripePaymentIntentId)) {
          const createResponse = await PaymentService.processPayment({
            appointmentId,
            amount: 150,
            currency: 'usd',
          });
          const createData = createResponse?.data || createResponse;
          const createdPayment = createData?.payment || createData;
          setPayment({
            ...createdPayment,
            clientSecret: createData?.clientSecret || createdPayment?.clientSecret,
          });
          setCompleted((createdPayment?.status || '').toLowerCase() === 'completed');
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [appointmentId]);

  const appointmentDate = appointment?.date ? new Date(appointment.date) : null;
  const formattedDate = appointmentDate && !Number.isNaN(appointmentDate.getTime())
    ? appointmentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date not set';

  const cardKeyMissing = !stripePromise;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">Payment Details</p>
          <h1 className="text-2xl font-bold text-text">Confirm appointment payment</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary rounded-2xl p-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Stripe checkout</h2>
              <p className="text-sm text-gray-500">Review the details and confirm with your card.</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-gray-500">Loading payment details...</div>
          ) : completed ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                Payment completed
              </div>
              <p className="text-sm text-green-700">{statusMessage || 'This appointment has already been paid.'}</p>
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl"
              >
                Back to dashboard
              </button>
            </div>
          ) : cardKeyMissing ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800 space-y-2">
              <div className="font-semibold">Stripe publishable key is missing</div>
              <p className="text-sm">
                Set <span className="font-mono">VITE_STRIPE_PUBLISHABLE_KEY</span> before building the frontend so the card form can load.
              </p>
            </div>
          ) : payment?.clientSecret ? (
            <PaymentForm
              payment={payment}
              currentUser={currentUser}
              onBack={() => navigate(-1)}
              onStatusChange={setStatusMessage}
              onSuccess={() => setCompleted(true)}
            />
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-gray-500">Preparing the payment form...</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Appointment summary</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-primary border border-blue-100">Pending confirmation</span>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-400">Doctor</span>
                <span className="font-semibold text-text text-right">{doctor?.userId?.name || doctor?.name || 'Doctor'}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-400">Specialization</span>
                <span className="font-semibold text-text text-right">{doctor?.specialization || 'General Physician'}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-400">Date</span>
                <span className="font-semibold text-text text-right">{formattedDate}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-400">Time</span>
                <span className="font-semibold text-text text-right">{appointment?.time || 'Time not set'}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-400">Appointment type</span>
                <span className="font-semibold text-text text-right">{appointment?.type || 'Consultation'}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-400">Amount</span>
                <span className="font-semibold text-text text-right">${payment?.amount || 150} {payment?.currency || 'USD'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] text-white rounded-3xl shadow-lg p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Lock className="w-4 h-4" />
              Secure payment flow
            </div>
            <p className="text-slate-200 leading-relaxed text-sm">
              Clicking confirm opens Stripe card processing. The appointment is only marked paid after Stripe succeeds and the backend verification step completes.
            </p>
            {statusMessage && (
              <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-sm text-slate-100">
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PatientPayment() {
  return stripePromise ? (
    <Elements stripe={stripePromise}>
      <PaymentContent />
    </Elements>
  ) : (
    <PaymentContent />
  );
}