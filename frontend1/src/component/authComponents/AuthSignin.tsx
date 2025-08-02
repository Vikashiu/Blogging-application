import { Link, useNavigate } from "react-router-dom"
import { useState, } from "react"
import axios from "axios"
import type { SigninInput } from '@vikash_ay/medium-common/dist/userValidation'
import type { SignupResponse } from "@/types/types"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthSignin = () => {
    const [postInputs, setPostInputs] = useState<SigninInput>({

        username: "",
        password: "",
    })
    const navigate = useNavigate();
    return <>

        <div className="h-screen flex justify-center items-center flex-col">
            {/* {JSON.stringify(postInputs)} */}
            <div className="text-3xl font-extrabold">
                Signin
            </div>
            <div className=" text-slate-400">
                New to medium?
                <Link className="pl-2 underline" to={"/signup"}> Signup</Link>
            </div>
            <div>
                <LabelledInput label={"Username"} placeholder="Enter an email" type="email" onChange={(e) => {

                    setPostInputs({
                        ...postInputs,
                        username: e.target.value
                    })
                }}></LabelledInput>
                <LabelledInput label={"Password"} placeholder="Enter 6 digit password" type="password" onChange={(e) => {

                    setPostInputs(postInputs => ({
                        ...postInputs,
                        password: e.target.value
                    }))
                }}></LabelledInput>

                <div className="pt-7 ">
                    <button type="button" onClick={async () => {
                        try {
                            if (!postInputs.username || !postInputs.password) {
                                alert("Please enter both username and password");
                                return;
                            }
                            const res = await axios.post<SignupResponse>(`${BACKEND_URL}api/v1/users/signin`, {
                                username: postInputs.username,
                                password: postInputs.password,
                            });

                            const token = res.data.token;
                            localStorage.setItem("token", token);

                            // optional: navigate to dashboard or homepage
                            navigate("/dashboard");
                        } catch (error: any) {
                            alert(error?.response?.data?.message || "Signin failed");
                        }

                    }} className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Submit</button>
                </div>
            </div>
        </div>
    </>
}
interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}
function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return <>
        <div className="min-w-sm ">
            <label className="pl-2 pt-3 block mb-2 text-sm  text-gray-900 dark:text-black font-bold">{label}</label>
            <input type={type || "text"} onChange={onChange} id="first_name" className="  border border-black text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-200 " placeholder={placeholder} required />
        </div>
    </>
}