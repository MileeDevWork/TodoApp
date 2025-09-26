import React from 'react'
import Logo from '../assets/logo.png'
import Loginimg from '../assets/Login.jpg'
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/api/authApi";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"


const Login = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      const res = await authApi.signin({ email: data.email, password: data.password });
      // res: { user, token }
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      // login(res.user, res.token); // nếu dùng context
      navigate("/");
    } catch (e: any) {
      alert(e.message || "Đăng nhập thất bại");
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
            style={{ backgroundImage: `url(${Loginimg})` }}></div>
          <div className="basis-1/2 flex items-center flex-col p-10 bg-white rounded-r-2xl">
            <div><img src={Logo} alt="Logo" className="w-full h-full object-cover"></img></div>
            <div className='pt-4 text-2xl'>Login</div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-4 pt-6 flex flex-col items-center">
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
                        Don't have an account?{" "}
                        <a href="/Register" className="text-blue-500 hover:underline">Sign up</a>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full w-80 h-12">Login</Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login