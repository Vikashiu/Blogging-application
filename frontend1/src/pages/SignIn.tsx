import { Quote } from "../component/authComponents/Quote"
import { AuthSignin } from "../component/authComponents/AuthSignin"
export const Signin = () => {
    return <div>
        <div className="transition duration-300 lg:grid grid-cols-2">
                    
            <div>
                <AuthSignin/>
            </div>
            <div className="hidden lg:block">
                <Quote />
            </div>
            
        </div>
    </div>
}