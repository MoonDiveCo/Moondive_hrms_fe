import Image from 'next/image'
import Leads from "../../public/Homepage/Leads.png"
import Calender from "../../public/Homepage/Calender.png"
export default function FeatuedTools({
  left = {
    title: 'All your employee data, organized in one place.',
    desc:
      'Automatically track clock-ins, breaks, overtime, and remote hours with precise, real-time attendance monitoring.',
    img: Leads,
  },
  right = {
    title: 'Time tracking that runs automatically',
    desc:
      'Give employees a simple way to request leave while managers get clear, fast approvals with accurate leave balances.',
    img: Calender,
  },
}) {
  return (
    <section className="container py-8">
      <div className="text-center mb-10 px-4 text-blackText">
        <div className="text-5xl font-semibold">Not sure where to start?</div>
        <div className="mt-2 text-5xl font-semibold">
          Discover our proven HR tools
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
        <article className="bg-[#EBF1FF] border-2 border-[#4362EF66] rounded-3xl px-8 pt-8 min-h-[360px] flex flex-col">
          <header className='px-5'>
            <h3 className="text-2xl font-semibold text-center text-slate-900 mb-3">
              {left.title}
            </h3>
            <p className="text-lg text-center text-primaryText font-normal">
              {left.desc}
            </p>
          </header>

          <div className="mt-6 flex-1 flex items-end">
          
            <div className="w-full  overflow-hidden bg-white p-4">
              <Image
                src={left.img}
                alt="left demo"
                className="w-full object-cover rounded-md"
                style={{ maxHeight: 220 }}
              />
            </div>
          </div>
        </article>
            <article className="bg-[#FFEFFB] border-2 border-[#DF3D8B99] rounded-3xl px-8 pt-8 min-h-[360px] flex flex-col">
          <header className='px-5'>
            <h3 className="text-2xl font-semibold text-center text-slate-900 mb-3">
              {right.title}
            </h3>
            <p className="text-lg text-center text-primaryText font-normal">
              {right.desc}
            </p>
          </header>

          <div className="mt-6 flex-1 flex items-center">
          
            <div className="w-full  overflow-hidden  p-4">
              <Image
                src={right.img}
                alt="left demo"
                className="w-full object-cover rounded-md"
                style={{ maxHeight: 220 }}
              />
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}