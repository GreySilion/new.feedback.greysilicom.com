export interface Review {
  id: number;
  user_id: number | null;
  owner_id: number | null;
  company_id: number;
  rating: number | null;
  review: string | null;
  reply: string | null;
  title: string | null;
  date: string | null;
  status: number | null; 
  reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  phone: string | null;
  email: string | null;
  name: string | null; // Reviewer's name
  uid: string | null;
  
  // Optional fields that might come from joins
  company_name?: string;
}
