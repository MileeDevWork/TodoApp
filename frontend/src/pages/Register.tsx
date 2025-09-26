import React from 'react';
import Logo from '../assets/logo.png';
import Login from '../assets/Login.jpg';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface SignupData {
  username: string;
  email: string;
  password: string;
}

const Register = () => {
  const form = useForm<SignupData>({
    defaultValues: {
      username: "",
      email: "",
      password: ""
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: SignupData) => {
    try {
      console.log('Sending request to:', '/api/auth/signup');
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Đăng ký thất bại: ${errorText}`);
      }

      const result = await response.json();
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      localStorage.setItem('token', result.token); // Lưu token tạm thời
      navigate('/login');
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      toast.error((error as Error).message || 'Đã xảy ra lỗi, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Cool Blue Glow Top */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage: `
            radial-gradient(
              circle at top center,
              rgba(70, 130, 180, 0.5),
              transparent 70%
            )
          `,
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Your Content/Components */}
      <div className="relative z-10 flex w-screen min-h-screen items-center justify-center">
        <div className=" flex w-4xl h-[600px] flex-row shadow-xl rounded-2xl">
          <div className="basis-1/2 bg-center bg-no-repeat bg-cover rounded-l-2xl"
            style={{ backgroundImage: `url(${Login})` }}></div>
          <div className="basis-1/2 flex items-center flex-col p-10 bg-white rounded-r-2xl">
            <div><img src={Logo} alt="Logo" className="w-full h-full object-cover"></img></div>
            <div className='pt-4 text-2xl'>Sign up</div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-4 pt-6 flex flex-col items-center">
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className='w-80 h-12' placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className='w-80 h-12' type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className='w-80 h-12' type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Already have an account?{" "}
                        <a href="/login" className="text-blue-500 hover:underline">Login</a>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full w-80 h-12">Sign up</Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;