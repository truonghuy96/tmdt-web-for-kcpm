import { motion } from 'motion/react';

export default function SloganQuote() {
  return (
    <section className="px-6 max-w-7xl mx-auto my-18 relative">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
        {/* Left Side: 60% */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:w-[60%]"
        >
          <h2 className="text-[28px] md:text-4xl lg:text-[48px] font-sans text-neutral-600 font-extrabold leading-[1.25] tracking-tighter">
            “Trong môi trường số, nơi mọi thứ đều có thể bị làm giả,
            <span className="relative z-10 mx-2 uppercase inline-block text-black text-[32px] md:text-5xl lg:text-[54px]">
              SỰ THẬT
            </span>
            chính là lợi thế cạnh tranh tối thượng.”
          </h2>
        </motion.div>
        
        {/* Right Side: 40% */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:w-[40%] flex flex-col justify-center pt-2 lg:pt-6"
        >
          <div className="flex flex-col space-y-12 border-l-[2px] border-neutral-200 pl-6 md:pl-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group cursor-default"
            >
              {/* Dot on the border */}
              <div className="absolute -left-[31px] md:-left-[47px] top-2 w-3 h-3 rounded-full bg-neutral-200 group-hover:bg-neutral-800 group-hover:scale-125 transition-all duration-300" />
              <p className="text-[17px] md:text-[19px] text-neutral-600 leading-relaxed font-medium group-hover:text-neutral-900 transition-colors duration-300 hover:font-semibold">
                Đạo đức không phải là rào cản của lợi nhuận. Đạo đức là bảo hiểm cho sự phát triển bền vững.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative group cursor-default"
            >
              {/* Dot on the border */}
              <div className="absolute -left-[31px] md:-left-[47px] top-2 w-3 h-3 rounded-full bg-neutral-200 group-hover:bg-neutral-800 group-hover:scale-125 transition-all duration-300" />
              <p className="text-[17px] md:text-[19px] text-neutral-600 leading-relaxed font-medium group-hover:text-neutral-900 transition-colors duration-300 hover:font-semibold">
                Pháp luật không triệt tiêu sự sáng tạo. Pháp luật thanh lọc sự dối trá.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
