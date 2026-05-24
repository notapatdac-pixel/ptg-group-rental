import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const DAYS = ["Mon 27", "Tue 28", "Wed 29", "Thu 30", "Fri 31"];
const TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

const MESSAGES = [
  { from: "specialist", name: "Kanya S.", text: "Hi! I've reviewed your application for Unit A2 at Rama 9. Everything looks great so far. When would you like to schedule your site walkthrough?", time: "14:20" },
  { from: "user", name: "You", text: "Hi Kanya, thanks for the quick response! I'm available Thursday or Friday afternoon this week.", time: "14:35" },
  { from: "specialist", name: "Kanya S.", text: "Perfect — I have Thursday 30th at 14:00 or 15:00 available. Would either of those work for you?", time: "14:42" },
];

export default function ScheduleChatPage() {
  return (
    <RetailerBackofficeLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">Schedule & Coordinate</h1>
        <p className="text-sm text-on-surface-variant mt-1">Book your site walkthrough and communicate with your PTG specialist.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar + booking */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-1">Book Site Walkthrough</h3>
            <p className="text-xs text-on-surface-variant mb-4">Select a date and time for your Rama 9 Station visit.</p>

            {/* Month header */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" className="text-on-surface-variant hover:text-on-surface bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <span className="text-sm font-semibold text-on-surface">October 2025</span>
              <button type="button" className="text-on-surface-variant hover:text-on-surface bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            {/* Days */}
            <div className="grid grid-cols-5 gap-1 mb-4">
              {DAYS.map((d) => {
                const [day, num] = d.split(" ");
                return (
                  <button key={d} type="button" className={`rounded-xl py-2 flex flex-col items-center gap-0.5 border-0 cursor-pointer transition-colors ${num === "30" ? "bg-primary text-white" : "bg-[#F5F2EB] text-on-surface hover:bg-primary/10"}`}>
                    <span className="text-[9px] font-bold uppercase">{day}</span>
                    <span className="text-sm font-bold">{num}</span>
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Available Times</div>
            <div className="grid grid-cols-3 gap-1.5">
              {TIMES.map((t) => (
                <button key={t} type="button" className={`py-1.5 rounded-lg text-xs font-medium border-0 cursor-pointer transition-colors ${t === "14:00" ? "bg-primary text-white" : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"}`}>
                  {t}
                </button>
              ))}
            </div>

            <button type="button" className="w-full mt-4 bg-[#1C3A1C] text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
              Confirm Walkthrough
            </button>
          </div>

          {/* Confirmed booking */}
          <div className="bg-primary rounded-2xl p-4 text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-lime-300 mb-1">Upcoming Visit</div>
            <div className="text-lg font-bold">Thu, Oct 30</div>
            <div className="text-sm text-white/80 mb-3">14:00 – 15:00 ICT</div>
            <div className="text-xs text-white/70">Rama 9 Station · Unit A2 Walkthrough</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
              <span className="material-symbols-outlined text-sm">person</span>
              Guide: Kanya Srisuk
            </div>
          </div>
        </div>

        {/* Chat thread */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden" style={{ height: "600px" }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-outline-variant/20">
            <div className="w-9 h-9 bg-lime-400 rounded-full flex items-center justify-center text-[#1C3A1C] font-bold text-sm">KS</div>
            <div>
              <div className="font-semibold text-sm text-on-surface">Kanya Srisuk</div>
              <div className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button type="button" className="text-on-surface-variant hover:text-on-surface bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-xl">phone</span>
              </button>
              <button type="button" className="text-on-surface-variant hover:text-on-surface bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-xl">info</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F2EB]">
            {MESSAGES.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.from === "specialist" ? "bg-lime-400 text-[#1C3A1C]" : "bg-primary text-white"}`}>
                  {msg.from === "specialist" ? "KS" : "Me"}
                </div>
                <div className={`max-w-[75%] ${msg.from === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${msg.from === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-white text-on-surface rounded-tl-sm shadow-sm"}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-lime-400 flex items-center justify-center text-xs font-bold text-[#1C3A1C] flex-shrink-0">KS</div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-outline-variant/20 flex gap-3 items-center">
            <button type="button" className="text-on-surface-variant hover:text-on-surface bg-transparent border-0 cursor-pointer">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <input placeholder="Type a message…" className="flex-1 bg-[#F5F2EB] rounded-full px-4 py-2.5 text-sm border-none outline-none" />
            <button type="button" className="w-9 h-9 bg-primary rounded-full flex items-center justify-center border-0 cursor-pointer">
              <span className="material-symbols-outlined text-white text-sm">send</span>
            </button>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
