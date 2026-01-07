import React, {
    useState,
    Children,
    ReactNode,
    HTMLAttributes,
    useRef,
    useEffect
} from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

/* =======================
   Types
======================= */

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

/* =======================
   Stepper
======================= */

type StepElement = React.ReactElement<{
    title?: string;
    children: ReactNode;
}>;

export default function Stepper({ children, ...rest }: StepperProps) {
    const stepsArray = Children.toArray(children) as StepElement[];
    const totalSteps = stepsArray.length;

    const [currentStep, setCurrentStep] = useState(0);

    return (
        <div className="flex w-full" {...rest}>
            {/* Indicators */}
            <div className="sticky top-0 h-screen flex flex-col items-center justify-center gap-4 px-6">
                {stepsArray.map((_, index) => {
                    const stepNumber = index + 1;
                    return (
                        <div
                            key={stepNumber}
                            className="flex flex-col items-center"
                        >
                            <StepIndicator
                                step={stepNumber}
                                currentStep={currentStep}
                            />
                            {index < totalSteps - 1 && (
                                <StepConnectorVertical
                                    isComplete={currentStep > stepNumber}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1">
                {stepsArray.map((step, index) => (
                    <Step
                        key={index}
                        index={index}
                        title={step.props.title}
                        onVisible={setCurrentStep}
                    >
                        {step.props.children}
                    </Step>
                ))}
            </div>
        </div>
    );
}

/* =======================
   Step (scroll-based)
======================= */

export function Step({
    title,
    children,
    index,
    onVisible
}: {
    title?: string;
    children: ReactNode;
    index: number;
    onVisible: (step: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const isInView = useInView(ref, {
        amount: 0.6,
        once: false
    });

    useEffect(() => {
        if (isInView) {
            onVisible(index + 1);
        }
    }, [isInView, index, onVisible]);

    return (
        <section
            ref={ref}
            className="h-screen flex items-center justify-center"
        >
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
                }
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="max-w-2xl w-full px-8 text-center"
            >
                {title && (
                    <h3 className="mb-6 text-2xl font-semibold">{title}</h3>
                )}
                {children}
            </motion.div>
        </section>
    );
}

/* =======================
   Step Indicator
======================= */

function StepIndicator({
    step,
    currentStep
}: {
    step: number;
    currentStep: number;
}) {
    const status =
        currentStep === step
            ? 'active'
            : currentStep > step
            ? 'complete'
            : 'inactive';

    return (
        <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-full font-semibold"
            animate={status}
            variants={{
                inactive: {
                    backgroundColor: '#222',
                    color: '#fff'
                },
                active: {
                    backgroundColor: '#c4b8a5',
                    color: '#312b22'
                },
                complete: {
                    backgroundColor: '#c4b8a5',
                    color: '#312b22'
                }
            }}
        >
            <div
                className={`h-3 w-3 rounded-full transition-colors duration-300 ${
                    status === 'inactive' ? 'bg-[#c4b8a5]' : 'bg-white'
                }`}
            ></div>
        </motion.div>
    );
}

/* =======================
   Vertical Connector
======================= */

function StepConnectorVertical({ isComplete }: { isComplete: boolean }) {
    return (
        <div className="relative h-24 w-1 bg-neutral-700 overflow-hidden rounded">
            <motion.div
                className="absolute top-0 left-0 w-full bg-[#c4b8a5]"
                animate={{ height: isComplete ? '100%' : 0 }}
                transition={{ duration: 0.6 }}
            />
        </div>
    );
}
