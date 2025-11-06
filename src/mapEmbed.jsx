import React from "react";

const MapEmbed = ({ branch }) => {
  const [view, setView] = React.useState("map");
  const [mapError, setMapError] = React.useState(false);

  const mapUrls = {
    "head-office": {
      map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.6996549126457!2d121.03973507487059!3d14.494490985979358!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ced7d8ccb009%3A0x1ddc76a4d0c7f01d!2sPrime%20Sales%20Inc.!5e1!3m2!1sen!2sph!4v1758073383851!5m2!1sen!2sph",
      street:
        "https://www.google.com/maps/embed?pb=!3m2!1sen!2sph!4v1758073096059!5m2!1sen!2sph!6m8!1m7!1shG6KFzXPmvgEjp2brJh6Og!2m2!1d14.49440815444086!2d121.0422333446858!3f30.36160468135993!4f1.7895207736753065!5f0.7820865974627469",
    },
    "cebu-branch": {
      map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2638.163978810476!2d123.94447366667224!3d10.330684749975978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a9984ca885cf11%3A0x3fc95dbf57a81384!2sPrime%20Sales%20Inc.%20-Cebu%20branch!5e1!3m2!1sen!2sph!4v1758074124194!5m2!1sen!2sph",
      street:
        "https://www.google.com/maps/embed?pb=!3m2!1sen!2sph!4v1758074460631!5m2!1sen!2sph!6m8!1m7!1s7UoBKGhq_Ev3sdS9bu8w4A!2m2!1d10.33088427626133!2d123.9471272348909!3f219.4758999160825!4f20.801348780485057!5f0.7820865974627469",
    },
  };

  const urls = mapUrls[branch] || {};

  return (
    <div className="my-3">
      {/* Toggle buttons */}

      <div className="flex gap-2 mb-2">
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            view === "map"
              ? "bg-green-600 text-white"
              : "bg-gray-400 text-white"
          }`}
          onClick={() => {
            setView("map");
            setMapError(false);
          }}
        >
          Map
        </button>
        <button
          className={`px-3 py-1 rounded-md text-sm ${
            view === "street"
              ? "bg-green-600 text-white"
              : "bg-gray-400 text-white"
          }`}
          onClick={() => {
            setView("street");
            setMapError(false);
          }}
        >
          Street View
        </button>
      </div>

      {/* Map iframe or fallback */}
      {!mapError ? (
        <iframe
          src={urls[view]}
          width="100%"
          height="300"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          className="rounded-xl shadow-md"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onError={() => setMapError(true)}
        ></iframe>
      ) : (
        <div className="text-red-500 text-center py-4">
          Map can’t be displayed right now. Please try again later.
        </div>
      )}
    </div>
  );
};

export default MapEmbed;
