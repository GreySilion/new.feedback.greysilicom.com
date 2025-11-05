'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function NewCompanyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('1. Form submission started');
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!formData.name.trim()) {
      console.log('2. Validation failed: Company name is required');
      setErrors({ ...errors, name: 'Company name is required' });
      return;
    }

    setIsSubmitting(true);
    console.log('3. Form is valid, setting isSubmitting to true');
    
    try {
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        status: 'PUBLISHED',
        feedback_message: 'Thank you for your feedback!',
        sms_sender_id: 'FEEDBACK'
      };
      
      console.log('4. Request data:', JSON.stringify(requestData, null, 2));
      
      console.log('5. Sending request to /api/companies');
      
      console.log('5. Sending request to /api/companies');
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestData),
      });
      
      console.log('6. Received response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create company');
      }

      console.log('5. Received response, status:', response.status);
      
      let data;
      try {
        const responseText = await response.text();
        console.log('7. Raw response text:', responseText);
        
        // Try to parse JSON only if there's content
        data = responseText ? JSON.parse(responseText) : {};
        console.log('8. Parsed response data:', data);
      } catch (jsonError) {
        console.error('9. Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('10. API Error:', data);
        const errorMessage = data?.error || data?.message || `Server error: ${response.status}`;
        console.error('11. Error details:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('12. Company created successfully, redirecting...');
      toast.success('Company created successfully!');
      
      // Show success message
      toast.success('Company created successfully!', {
        duration: 2000,
      });
      
      // Wait for the toast to be visible
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to companies page
      router.push('/companies');
      router.refresh(); // Ensure the page updates with the new company
    } catch (error) {
      console.error('9. Error in handleSubmit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create company';
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      console.log('10. Final cleanup, setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={(e) => {
            e.preventDefault();
            router.back();
          }}
          className="mb-6 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        
        <form onSubmit={handleSubmit} className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Create New Company</CardTitle>
              <CardDescription>Add a new company to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium leading-none">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your company"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end space-x-3 border-t bg-gray-50 px-6 py-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/companies')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : 'Create Company'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
