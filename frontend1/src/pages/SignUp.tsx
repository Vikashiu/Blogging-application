import { Quote } from "../component/authComponents/Quote"
import { Auth } from "../component/authComponents/Auth"
export const Signup = () => {
    return <div>
        <div className="transition duration-300 lg:grid grid-cols-2">
            
            <div>
                <Auth/>
            </div>
            <div className="hidden lg:block">
                <Quote />
            </div>
            
        </div>
        
    </div>
}