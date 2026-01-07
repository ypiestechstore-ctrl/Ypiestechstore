"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
    Cpu,
    Zap,
    HardDrive,
    CircuitBoard,
    Fan,
    Database,
    Monitor,
    Keyboard,
    Mouse,
    Info,
    ArrowRight
} from "lucide-react";
import { MiniGame } from "./MiniGame";
import { cn } from "@/lib/utils";

interface ComponentItem {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
    description: string;
}

const components: ComponentItem[] = [
    { id: "mobo", name: "Motherboard", icon: CircuitBoard, color: "bg-slate-600", description: "The heart of the PC." },
    { id: "cpu", name: "CPU", icon: Cpu, color: "bg-blue-500", description: "The brain." },
    { id: "ram", name: "RAM", icon: HardDrive, color: "bg-yellow-500", description: "Short-term memory." },
    { id: "gpu", name: "GPU", icon: Zap, color: "bg-green-500", description: "Graphics power." },
    { id: "ssd", name: "SSD", icon: Database, color: "bg-red-500", description: "Storage." },
    { id: "psu", name: "Power", icon: Zap, color: "bg-orange-500", description: "Energy source." },
    { id: "fan", name: "Cooling", icon: Fan, color: "bg-cyan-500", description: "Keep it cool." },
];

export function InteractiveHero() {
    const [placedComponents, setPlacedComponents] = useState<string[]>([]);
    const [isBooting, setIsBooting] = useState(false);
    const [isAssembled, setIsAssembled] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);

    const handleDragEnd = (componentId: string, info: PanInfo) => {
        if (info.offset.x !== 0 || info.offset.y !== 0) {
            if (!placedComponents.includes(componentId)) {
                const newPlaced = [...placedComponents, componentId];
                setPlacedComponents(newPlaced);
                if (showTutorial) setShowTutorial(false);

                // Check completion
                if (newPlaced.length === components.length) {
                    setIsBooting(true);
                    setTimeout(() => {
                        setIsBooting(false);
                        setIsAssembled(true);
                    }, 3000);
                }
            }
        }
    };

    return (
        <div className="relative flex min-h-[700px] w-full flex-col items-center justify-center overflow-hidden bg-slate-950 p-4 text-white">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#4f4f4f 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            <div className="z-10 flex w-full max-w-6xl flex-col items-center gap-8">

                {/* Header Text */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                        <span className="text-primary">Build</span> Your Battlestation
                    </h1>
                    <p className="text-slate-400">
                        {isAssembled
                            ? "System Online. Ready to Play."
                            : `Assemble your rig: ${placedComponents.length} / ${components.length} components installed`}
                    </p>
                </div>

                {/* The Desk Setup */}
                <div className="relative mt-8 flex w-full max-w-5xl flex-col items-center justify-end rounded-xl border-b-8 border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm md:h-[500px] md:flex-row md:items-end md:justify-center md:gap-12">

                    {/* Tutorial Overlay */}
                    <AnimatePresence>
                        {showTutorial && placedComponents.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-1/2 top-10 z-50 -translate-x-1/2 rounded-lg border border-primary bg-primary/20 p-4 text-center backdrop-blur-md"
                            >
                                <div className="flex items-center gap-2 font-bold text-primary-foreground">
                                    <Info className="h-5 w-5" />
                                    <span>How to Play</span>
                                </div>
                                <p className="mt-1 text-sm text-slate-200">
                                    Drag components from the tray below into the PC case to build your computer!
                                </p>
                                <div className="mt-2 flex justify-center">
                                    <ArrowRight className="h-6 w-6 animate-bounce text-primary" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Monitor */}
                    <div className="relative z-10 flex flex-col items-center order-1 md:order-2">
                        <div className={cn(
                            "relative flex h-[200px] w-[300px] items-center justify-center overflow-hidden rounded-t-xl border-4 border-slate-700 bg-black shadow-2xl transition-all duration-1000 md:h-[280px] md:w-[450px]",
                            isAssembled ? "border-primary shadow-[0_0_50px_rgba(124,58,237,0.3)]" : ""
                        )}>
                            {/* Screen Content */}
                            {!isAssembled && !isBooting && (
                                <div className="flex flex-col items-center gap-2 text-slate-600">
                                    <Monitor className="h-12 w-12" />
                                    <span className="text-xs font-mono">NO SIGNAL</span>
                                </div>
                            )}
                            {isBooting && (
                                <div className="flex flex-col items-center gap-4 font-mono text-green-500">
                                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-800 border-t-green-500"></div>
                                    <p className="animate-pulse">BOOTING SYSTEM...</p>
                                    <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3 }}
                                            className="h-full bg-green-500"
                                        />
                                    </div>
                                </div>
                            )}
                            {isAssembled && (
                                <div className="h-full w-full relative">
                                    <div className="absolute top-2 left-2 z-20 rounded bg-black/50 px-2 py-1 text-[10px] text-slate-300">
                                        Controls: Space / Click to Jump
                                    </div>
                                    <MiniGame />
                                </div>
                            )}
                        </div>
                        {/* Monitor Stand */}
                        <div className="h-12 w-4 bg-slate-700"></div>
                        <div className="h-2 w-32 rounded-full bg-slate-700"></div>
                    </div>

                    {/* PC Case - Visual Progression */}
                    <div className={cn(
                        "relative mt-8 flex h-[350px] w-[200px] flex-col rounded-lg border-2 border-slate-700 bg-slate-900/90 p-3 shadow-xl transition-all duration-500 md:mt-0 order-2 md:order-1",
                        isAssembled ? "border-primary shadow-[0_0_30px_rgba(124,58,237,0.5)]" : ""
                    )}>
                        {/* Glass Panel Reflection */}
                        <div className="absolute inset-0 z-20 rounded-lg bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

                        {/* Internal Layout */}
                        <div className="relative h-full w-full overflow-hidden rounded border border-slate-800 bg-black/80">

                            {/* Motherboard (Base) */}
                            <AnimatePresence>
                                {placedComponents.includes("mobo") && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-2 bg-slate-800 border border-slate-700 rounded-sm"
                                    >
                                        {/* Mobo Details */}
                                        <div className="absolute top-2 left-2 w-8 h-20 bg-slate-700 rounded-sm"></div>
                                        <div className="absolute bottom-2 right-2 w-12 h-12 bg-slate-700 rounded-sm"></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* CPU */}
                            <AnimatePresence>
                                {placedComponents.includes("cpu") && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-300 rounded-sm flex items-center justify-center z-10"
                                    >
                                        <div className="w-8 h-8 border border-slate-400"></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* RAM */}
                            <AnimatePresence>
                                {placedComponents.includes("ram") && (
                                    <motion.div
                                        key="ram-1"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 40 }}
                                        className="absolute top-1/3 right-8 w-2 bg-yellow-500 rounded-sm z-10 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                    ></motion.div>
                                )}
                                {placedComponents.includes("ram") && (
                                    <motion.div
                                        key="ram-2"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 40 }}
                                        transition={{ delay: 0.1 }}
                                        className="absolute top-1/3 right-6 w-2 bg-yellow-500 rounded-sm z-10 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                    ></motion.div>
                                )}
                            </AnimatePresence>

                            {/* GPU */}
                            <AnimatePresence>
                                {placedComponents.includes("gpu") && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="absolute top-1/2 left-2 right-2 h-8 bg-slate-700 border-2 border-slate-600 rounded-sm z-20 flex items-center px-2"
                                    >
                                        <div className="w-full h-1 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Cooler */}
                            <AnimatePresence>
                                {placedComponents.includes("fan") && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-600 z-15 flex items-center justify-center"
                                    >
                                        <Fan className={cn("h-10 w-10 text-slate-400", isAssembled ? "animate-spin text-cyan-400" : "")} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* PSU */}
                            <AnimatePresence>
                                {placedComponents.includes("psu") && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute bottom-0 left-0 right-0 h-16 bg-slate-800 border-t border-slate-700 z-10 flex items-center justify-center"
                                    >
                                        <div className="text-[10px] font-bold text-slate-500">PSU 850W</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* SSD */}
                            <AnimatePresence>
                                {placedComponents.includes("ssd") && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute bottom-20 right-2 w-10 h-14 bg-slate-700 border border-slate-600 rounded-sm z-10 flex items-center justify-center"
                                    >
                                        <span className="text-[8px] text-red-400">SSD</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* RGB Lighting (Final) */}
                            {isAssembled && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    className="absolute inset-0 bg-gradient-to-t from-purple-500 via-transparent to-blue-500 z-30 pointer-events-none mix-blend-overlay"
                                />
                            )}
                        </div>
                    </div>

                    {/* Peripherals */}
                    <div className="absolute bottom-4 left-10 hidden opacity-50 md:block">
                        <Keyboard className="h-16 w-32 text-slate-600" />
                    </div>
                    <div className="absolute bottom-4 right-10 hidden opacity-50 md:block">
                        <Mouse className="h-10 w-8 text-slate-600" />
                    </div>
                </div>

                {/* Component Tray */}
                {!isAssembled && (
                    <div className="flex w-full flex-wrap justify-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
                        <AnimatePresence>
                            {components.map((comp) => (
                                !placedComponents.includes(comp.id) && (
                                    <motion.div
                                        key={comp.id}
                                        drag
                                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                        dragElastic={0.2}
                                        onDragEnd={(_, info) => handleDragEnd(comp.id, info)}
                                        whileHover={{ scale: 1.1, cursor: "grab" }}
                                        whileDrag={{ scale: 1.2, cursor: "grabbing", zIndex: 50 }}
                                        className={cn(
                                            "group relative flex h-20 w-20 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 shadow-lg backdrop-blur-sm transition-colors hover:border-white/30",
                                            "bg-slate-800"
                                        )}
                                    >
                                        <div className={cn("rounded-full p-2", comp.color)}>
                                            <comp.icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{comp.name}</span>

                                        {/* Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 scale-0 rounded bg-black px-2 py-1 text-center text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 pointer-events-none z-50">
                                            {comp.description}
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
