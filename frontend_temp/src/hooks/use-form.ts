import { useForm, UseFormReturn, SubmitHandler, FieldValues, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodType } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';

type ZodSchema = z.ZodObject<any> | z.ZodEffects<z.ZodObject<any>>;

export function useZodForm<TSchema extends ZodSchema>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema as any),
    mode: 'onChange',
    ...options,
  });
}

export function useApiForm<TSchema extends ZodSchema, TData = any>(
  schema: TSchema,
  submitFn: (data: z.infer<TSchema>) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
    formOptions?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>;
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useZodForm(schema, options?.formOptions);

  const handleSubmit: SubmitHandler<z.infer<TSchema>> = async (data) => {
    try {
      setIsSubmitting(true);
      const result = await submitFn(data);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      
      if (options?.onError) {
        options.onError(error as Error);
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : options?.errorMessage || 'An error occurred';
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...form,
    handleSubmit: form.handleSubmit(handleSubmit),
    isSubmitting,
  };
}

// Example usage:
/*
const formSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors }, isSubmitting } = useApiForm(
    formSchema,
    async (data) => {
      const { data: result, error } = await apiClient.post('/auth/login', data);
      if (error) throw new Error(error);
      return result;
    },
    {
      successMessage: 'Logged in successfully!',
      errorMessage: 'Failed to log in',
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
      
      <input type="password" {...register('password')} />
      {errors.password && <p>{errors.password.message}</p>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
*/
