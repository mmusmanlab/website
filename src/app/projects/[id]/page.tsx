import React from 'react';
import { CheckCircle2 } from 'my-icons'; // Adjust import as per actual icon path

const ProjectFeaturesShowcase = () => {
    const features = [
        { title: 'Performance Optimized', description: 'This project has been optimized for maximum performance.' },
        { title: 'Responsive Design', description: 'The app adapts to different screen sizes seamlessly.' },
        { title: 'Production Ready', description: 'Ready for deployment with all necessary components.' },
        { title: 'Fully Documented', description: 'Documentation provided for all aspects of the project.' },
    ];

    return (
        <div>
            {features.map((feature, index) => (
                <div key={index} className="feature-card">
                    <CheckCircle2 />
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                </div>
            ))}
        </div>
    );
};

export default ProjectFeaturesShowcase;

// Note: Additional styling and classNames would need to be defined in your CSS or framework styles.