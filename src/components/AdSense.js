import React, { useEffect } from 'react';

const AdSense = () => {
  useEffect(() => {
    // Only load AdSense in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // Push the ad to the adsbygoogle array
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('Error loading AdSense:', err);
      }
    }
  }, []);

  // Only render the ad container in production
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className="ad-placeholder p-4 bg-light text-center border rounded">
        <p className="mb-0">Ad placeholder (only visible in production)</p>
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-5578074907187073"
      data-ad-slot="7582910301"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default AdSense; 