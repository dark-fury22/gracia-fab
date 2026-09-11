import "./CommunityGrid.css";

const communityPhotos = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&crop=face",
    handle: "@amaka.glow",
    style: "30\" Bone Straight",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=500&fit=crop&crop=face",
    handle: "@chidera_xo",
    style: "Melanin Radiance Serum",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&h=500&fit=crop&crop=face",
    handle: "@tiwa_b",
    style: "Glueless Body Wave",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=500&h=500&fit=crop&crop=face",
    handle: "@zainab.adenuga",
    style: "Bridal Glow Routine",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=500&h=500&fit=crop&crop=face",
    handle: "@kemi.lux",
    style: "Raw Curly Bundles",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop&crop=face",
    handle: "@somto.beauty",
    style: "Caramel Highlight Unit",
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500&h=500&fit=crop&crop=face",
    handle: "@ronke_style",
    style: "HD Swiss Closure",
  },
  {
    id: 8,
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=500&fit=crop&crop=face",
    handle: "@dupe.ade",
    style: "Vitamin C Brightening",
  },
  {
    id: 9,
    img: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=500&h=500&fit=crop&crop=face",
    handle: "@ifeoma_v",
    style: "34\" Raw Bundles",
  },
];

function CommunityGrid() {
  return (
    <section className="community-section" aria-label="Community Wall">
      <div className="community-inner">
        <div className="community-header">
          <span className="community-eyebrow">OUR COMMUNITY</span>
          <h2 className="community-title">#GraciaFabGlow</h2>
          <p>
            Real African women styling our 100% raw virgin hair and radiating with clinical skincare.
          </p>
        </div>

        <div className="community-mosaic">
          {communityPhotos.map((photo) => (
            <div key={photo.id} className="community-tile">
              <img
                src={photo.img}
                alt={photo.style}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop";
                }}
              />
              <div className="community-overlay">
                <span className="community-handle">{photo.handle}</span>
                <span className="community-item-tag">{photo.style}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="community-action">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="community-btn"
          >
            Follow @graciafab on Instagram →
          </a>
        </div>
      </div>
    </section>
  );
}

export default CommunityGrid;
