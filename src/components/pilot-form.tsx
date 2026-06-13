import { startTransition, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

type PilotFormState = {
  businessName: string;
  contactPerson: string;
  businessType: string;
  town: string;
  currentlyOfferDelivery: string;
  currentDeliveryMethod: string;
  averageDeliveriesPerWeek: string;
  mainDeliveryPain: string;
  localDeliveryPartnerInterest: string;
  shortInterviewInterest: string;
  whatsappNumber: string;
  email: string;
};

const initialState: PilotFormState = {
  businessName: "",
  contactPerson: "",
  businessType: "",
  town: "",
  currentlyOfferDelivery: "",
  currentDeliveryMethod: "",
  averageDeliveriesPerWeek: "",
  mainDeliveryPain: "",
  localDeliveryPartnerInterest: "",
  shortInterviewInterest: "",
  whatsappNumber: "",
  email: "",
};

export function PilotForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/business-pilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
    } catch (submissionError) {
      if (import.meta.env.DEV) {
        window.localStorage.setItem(
          "tsa-kasi-dev-pilot-submission",
          JSON.stringify({
            submittedAt: new Date().toISOString(),
            payload: form,
          }),
        );
      } else {
        setError("Submission failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      console.warn("Pilot form submission fallback used in development.", submissionError);
    }

    setForm(initialState);
    startTransition(() => {
      navigate("/pilot/thank-you");
    });
  }

  return (
    <form className="pilot-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <Field
          label="Business name"
          value={form.businessName}
          onChange={(value) => setForm((current) => ({ ...current, businessName: value }))}
          placeholder="Example: Modimolle Fresh Mart"
        />
        <Field
          label="Contact person"
          value={form.contactPerson}
          onChange={(value) => setForm((current) => ({ ...current, contactPerson: value }))}
          placeholder="Full name"
        />
        <Field
          label="Business type"
          value={form.businessType}
          onChange={(value) => setForm((current) => ({ ...current, businessType: value }))}
          placeholder="Restaurant, pharmacy, retailer..."
        />
        <Field
          label="Town"
          value={form.town}
          onChange={(value) => setForm((current) => ({ ...current, town: value }))}
          placeholder="Modimolle, Bela-Bela..."
        />
        <SelectField
          label="Do you currently offer delivery?"
          value={form.currentlyOfferDelivery}
          onChange={(value) =>
            setForm((current) => ({ ...current, currentlyOfferDelivery: value }))
          }
          options={["Yes", "No", "Planning to start soon"]}
        />
        <Field
          label="Average number of deliveries per week"
          value={form.averageDeliveriesPerWeek}
          onChange={(value) =>
            setForm((current) => ({ ...current, averageDeliveriesPerWeek: value }))
          }
          placeholder="Example: 25"
        />
        <SelectField
          label="Would you consider using a local delivery partner?"
          value={form.localDeliveryPartnerInterest}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              localDeliveryPartnerInterest: value,
            }))
          }
          options={["Yes", "Maybe", "No"]}
        />
        <SelectField
          label="Would you be open to a short interview?"
          value={form.shortInterviewInterest}
          onChange={(value) =>
            setForm((current) => ({ ...current, shortInterviewInterest: value }))
          }
          options={["Yes", "Maybe", "No"]}
        />
        <Field
          label="WhatsApp number"
          value={form.whatsappNumber}
          onChange={(value) => setForm((current) => ({ ...current, whatsappNumber: value }))}
          placeholder="+27..."
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((current) => ({ ...current, email: value }))}
          placeholder="name@business.co.za"
        />
      </div>

      <TextAreaField
        label="How do you currently handle delivery?"
        value={form.currentDeliveryMethod}
        onChange={(value) =>
          setForm((current) => ({ ...current, currentDeliveryMethod: value }))
        }
        placeholder="Own driver, owner deliveries, third-party rider, no formal process..."
      />

      <TextAreaField
        label="Main delivery pain"
        value={form.mainDeliveryPain}
        onChange={(value) => setForm((current) => ({ ...current, mainDeliveryPain: value }))}
        placeholder="Fuel costs, delays, rider management, failed deliveries..."
      />

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button button-primary form-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Submitting..." : "Submit business delivery interview"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <select required value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: TextAreaFieldProps) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea
        required
        rows={4}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
