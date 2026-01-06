import * as React from 'react';
import Stepper, { Step } from '../components/animations/Stepper';
import { useState } from 'react';

export default function Experiences() {
    const [name, setName] = useState('');

    return (
        <section className="w-screen flex items-center justify-start pl-20 pr-4 ">
            <Stepper>
                <div title="2009 - 2012">
                    <h2 className="text-2xl font-semibold mb-2">
                        Welcome to the React Bits stepper!
                    </h2>
                    <p>Check out the next step!</p>
                </div>

                <div title="2012 - 2015">
                    <h2 className="text-2xl font-semibold mb-2">Step 2</h2>
                    <img
                        style={{
                            height: '100px',
                            width: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center -70px',
                            borderRadius: '15px',
                            marginTop: '1em'
                        }}
                        src="https://www.purrfectcatgifts.co.uk/cdn/shop/collections/Funny_Cat_Cards_640x640.png?v=1663150894"
                        alt="Step 2"
                    />
                    <p>Custom step content!</p>
                </div>

                <div title="2017 - 2024">
                    <h2 className="text-2xl font-semibold mb-2">
                        How about an input?
                    </h2>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name?"
                        className="border border-gray-300 rounded px-2 py-1 mt-2 w-full max-w-sm"
                    />
                </div>

                <div title="2024 - Now">
                    <h2 className="text-2xl font-semibold mb-2">Final Step</h2>
                    <p>You made it!</p>
                </div>
                <div title="The End">
                    <h2 className="text-2xl font-semibold mb-2">
                        All Steps Completed
                    </h2>
                </div>
            </Stepper>
        </section>
    );
}
