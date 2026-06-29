import { useEffect, useState } from "react";

interface Submission {
  id: string;
  created_at: string;
  business_name: string;
  contact_person: string;
  business_type: string;
  town: string;
  currently_offer_delivery: string;
  current_delivery_method: string;
  average_deliveries_per_week: string;
  main_delivery_pain: string;
  local_delivery_partner_interest: string;
  short_interview_interest: string;
  whatsapp_number: string;
  email: string;
  source: string;
}

interface AdminSubmissionsProps {
  token: string;
  onLogout: () => void;
}

export function AdminSubmissions({ token, onLogout }: AdminSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSubmissions() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/submissions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch submissions");
        }

        const data = (await response.json()) as { submissions: Submission[] };
        setSubmissions(data.submissions);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load submissions",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchSubmissions();
  }, [token]);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Pilot Program Submissions</h1>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="admin-content">
        {isLoading && <div className="loading">Loading submissions...</div>}
        {error && <div className="error-message">{error}</div>}

        {!isLoading && submissions.length === 0 && (
          <div className="empty-state">
            <p>No submissions yet.</p>
          </div>
        )}

        {!isLoading && submissions.length > 0 && (
          <div className="submissions-list">
            <div className="submissions-count">
              Total submissions: {submissions.length}
            </div>
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Business Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>WhatsApp</th>
                  <th>Town</th>
                  <th>Business Type</th>
                  <th>Offers Delivery</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="submission-row">
                    <td>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                    <td>{submission.business_name}</td>
                    <td>{submission.contact_person}</td>
                    <td>
                      <a href={`mailto:${submission.email}`}>
                        {submission.email}
                      </a>
                    </td>
                    <td>
                      <a href={`https://wa.me/${submission.whatsapp_number}`}>
                        {submission.whatsapp_number}
                      </a>
                    </td>
                    <td>{submission.town}</td>
                    <td>{submission.business_type}</td>
                    <td>{submission.currently_offer_delivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
