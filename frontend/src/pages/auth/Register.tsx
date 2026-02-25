import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterSchema, type RegisterInput } from '@reactpress/shared';
import { useAuth } from '../../hooks/useAuth';

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(RegisterSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
      navigate('/login?registered=1');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed';
      setError('root', { message });
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md text-sm">
              {errors.root.message}
            </div>
          )}

          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" className="input" {...register('username')} placeholder="johndoe" />
            {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" {...register('email')} placeholder="you@example.com" />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" {...register('password')} placeholder="Min 8 characters" />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
