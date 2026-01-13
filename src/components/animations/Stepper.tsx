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

/* =====================================================
   STEP ITEM
   -----------------------------------------------------
   - Wrapper-komponent för ett steg
   - Används endast för struktur och props (title, children)
   - Renderar sitt innehåll rakt igenom
===================================================== */
export function StepItem({
    title,
    children
}: {
    title?: string;
    children: ReactNode;
}) {
    return <>{children}</>;
}

/* =====================================================
   TYPES
===================================================== */
interface StepperProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

type StepElement = React.ReactElement<{
    title?: string;
    children: ReactNode;
}>;

/* =====================================================
   STEPPER
   -----------------------------------------------------
   - Huvudkomponent som styr hela flödet
   - Ansvarar för:
     • Mobile / Desktop-layout
     • Aktivt steg
     • Sticky indikatorer (desktop)
===================================================== */
export default function Stepper({ children, ...rest }: StepperProps) {
    /* -----------------------------------------------
       STEPS
       -----------------------------------------------
       - Konverterar children till en array
       - Filtrerar bort null/undefined
    ------------------------------------------------ */
    const stepsArray = Children.toArray(children).filter(
        Boolean
    ) as StepElement[];

    const totalSteps = stepsArray.length;

    /* -----------------------------------------------
       STATE
    ------------------------------------------------ */
    const [currentStep, setCurrentStep] = useState(0);

    const [isMobile, setIsMobile] = useState<boolean>(() => {
        //SSR check
        if (typeof window !== 'undefined') {
            return window.innerWidth < 1024;
        }
        return false;
    });

    const [isClient, setIsClient] = useState(false);

    /* -----------------------------------------------
       CLIENT + RESPONSIVE CHECK
       -----------------------------------------------
       - Säkerställer client-side rendering
       - Undviker hydration mismatch
       - Uppdaterar mobile breakpoint vid resize
    ------------------------------------------------ */
    useEffect(() => {
        setIsClient(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /* -----------------------------------------------
       FALLBACK UNDER HYDRATION
    ------------------------------------------------ */
    if (!isClient) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    /* =================================================
       MOBILE VERSION
       -------------------------------------------------
       - Vertikal layout
       - Ingen sticky logik
       - Varje steg hanterar sin egen animation
    ================================================= */
    if (isMobile) {
        return (
            <div className="w-full flex flex-col mb-10" {...rest}>
                {stepsArray.map((step, index) => (
                    <MobileStep
                        key={index}
                        index={index}
                        title={step.props.title}
                        totalSteps={totalSteps}
                    >
                        {step.props.children}
                    </MobileStep>
                ))}
            </div>
        );
    }

    /* =================================================
       DESKTOP VERSION
       -------------------------------------------------
       - Sticky indikatorer till vänster
       - Scroll-baserad aktivering av steg
       - Innehåll till höger
    ================================================= */
    return (
        <div className="flex w-full" {...rest}>
            {/* Sticky indikator-kolumn */}
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

            {/* Scroll-innehåll */}
            <div className="flex flex-col flex-1">
                {stepsArray.map((step, index) => (
                    <ScrollStep
                        key={index}
                        index={index}
                        title={step.props.title}
                        onVisible={setCurrentStep}
                    >
                        {step.props.children}
                    </ScrollStep>
                ))}
            </div>
        </div>
    );
}

/* =====================================================
   MOBILE STEP
   -----------------------------------------------------
   - Vertikalt steg
   - Aktiveras med useInView
   - Ingen sticky behavior
===================================================== */
function MobileStep({
    title,
    children,
    index,
    totalSteps
}: {
    title?: string;
    children: ReactNode;
    index: number;
    totalSteps: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const isInView = useInView(ref, {
        amount: 0.2,
        once: false,
        margin: '-100px 0px -100px 0px'
    });

    const isLast = index === totalSteps - 1;

    return (
        <div className="relative flex items-start py-6 px-4 min-h-[200px]">
            {/* Vänster indikator */}
            <div className="flex flex-col items-center mr-4 flex-shrink-0 pt-1">
                <motion.div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    animate={isInView ? 'active' : 'inactive'}
                    variants={{
                        inactive: {
                            backgroundColor: '#222',
                            scale: 0.9
                        },
                        active: {
                            backgroundColor: '#c4b8a5',
                            scale: 1
                        }
                    }}
                >
                    <div
                        className={`h-2 w-2 rounded-full ${
                            isInView ? 'bg-white' : 'bg-[#c4b8a5]'
                        }`}
                    />
                </motion.div>

                {!isLast && (
                    <div className="w-px h-full min-h-[120px] bg-neutral-300 mt-2" />
                )}
            </div>

            {/* Innehåll */}
            <div ref={ref} className="flex-1">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={
                        isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
                    }
                    transition={{ duration: 0.5 }}
                >
                    {title && (
                        <p className="text-sm font-semibold text-[#c4b8a5] mb-2">
                            {title}
                        </p>
                    )}
                    {children}
                </motion.div>
            </div>
        </div>
    );
}

/* =====================================================
   DESKTOP SCROLL STEP
   -----------------------------------------------------
   - Ett steg per viewport-höjd
   - useInView styr vilket steg som är aktivt
===================================================== */
export function ScrollStep({
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
                transition={{ duration: 0.6 }}
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

/* =====================================================
   STEP INDICATOR (DESKTOP)
   -----------------------------------------------------
   - Visar status: inactive / active / complete
===================================================== */
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
            className="flex h-12 w-12 items-center justify-center rounded-full"
            animate={status}
            variants={{
                inactive: { backgroundColor: '#222' },
                active: { backgroundColor: '#c4b8a5' },
                complete: { backgroundColor: '#c4b8a5' }
            }}
        >
            <div
                className={`h-3 w-3 rounded-full ${
                    status === 'inactive' ? 'bg-[#c4b8a5]' : 'bg-white'
                }`}
            />
        </motion.div>
    );
}

/* =====================================================
   STEP CONNECTOR (DESKTOP)
   -----------------------------------------------------
   - Vertikal linje mellan steg
   - Fylls när föregående steg är klart
===================================================== */
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
