import { NavLanding } from "../component/LandingComponents/NavLanding"
import { HeroLanding } from "../component/LandingComponents/HeroLanding"
import { FooterLanding } from "../component/LandingComponents/footerLanding"
export function LandingPage(){

    return <>
        <div className="bg-amber-50 min-h-screen flex flex-col justify-between">
            <NavLanding/>
            
            <HeroLanding/>
            
            <FooterLanding/>
        </div>

    </>

}