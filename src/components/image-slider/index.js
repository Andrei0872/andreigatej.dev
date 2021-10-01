import React from 'react';

import './image-slider.css';

import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

const ImageSlider = ({ imagesPaths, imageProps }) => {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!imagesPaths || !imagesPaths.length) {
    return null;
  }

  return (
    <div className="c-slider">
      <div className="c-slider__button-container">
        <button
          onClick={() => setSelectedImageIdx(selectedImageIdx === 0 ? imagesPaths.length - 1 : selectedImageIdx - 1)}
          className="c-slider__button c-slider__button--left"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>

      <div className="c-slider__images-container">
        {
          imagesPaths.map(
            (p, imgIdx) => (
              <div
                className={`c-slider__image ${imgIdx === selectedImageIdx ? 'is-selected' : ''}`}
                key={p}
              >
                {imgIdx === selectedImageIdx && <img width={imageProps.width} height={imageProps.height} src={p} alt="Demo image for project" />}
              </div>
            )
          )
        }
      </div>
    
    <div className="c-slider__button-container">
        <button 
          onClick={() => setSelectedImageIdx(selectedImageIdx === imagesPaths.length - 1 ? 0 : selectedImageIdx + 1)}
          className="c-slider__button c-slider__button--right"
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
    </div>
    </div>
  )
};

export default ImageSlider;
