export function HeroLanding() {
    return (
        <div className="h-[34rem] border-b flex justify-between p-3 overflow-hidden">

            <div className=" flex flex-col justify-center pl-8 md:pl-[6.25rem] gap-2 ">
                <div className="text-7xl font-serif font-medium lg:text-8xl">Human</div>
                <div className="text-7xl font-serif font-medium lg:text-8xl">stories & ideas</div>
                <div className="text-2xl pt-8 pb-8">A place to read, write, and deepen your understanding</div>

                <button
                    className="text-2xl bg-green-700 text-amber-50 w-[11.25rem] h-11 flex flex-col justify-center items-center rounded-3xl hover:bg-green-800 transition"
                >
                    Start reading
                </button>

            </div>

            {/* <div className="hidden lg:block ">
                <img className="w-full h-full object-contain" src="artwork.png" alt="" />
            </div> */}
            <div className="hidden lg:flex items-center justify-center pr-8 max-w-[500px]">
                <img src="artwork.png" alt="Artwork" className="object-contain w-full h-auto" />
            </div>

        </div>
    )
}
