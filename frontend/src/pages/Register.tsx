import React from 'react'
import Logo from '../assets/logo.png'
import Login from '../assets/Login.jpg'
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from '@/components/ui/input'

const Register = () => {
  const form = useForm({
    defaultValues: {
      username: "",
    },
  });

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
            <h2 className='pt-4'>Sign up</h2>
            <Form {...form}>
              <form className="space-y-8 pt-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Name" {...field} className='w-80 h-12' />
                      </FormControl>
                      <FormControl>
                        <Input placeholder="Email" {...field} className='w-80 h-12' />
                      </FormControl>
                      <FormControl>
                        <Input placeholder="Password" {...field} className='w-80 h-12' />
                      </FormControl>
                      <FormDescription>
                        Already have an account? Login
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className='w-80 h-12'>Sign up</Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register