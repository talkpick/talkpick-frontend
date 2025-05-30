import React from 'react';
// import PropTypes from 'prop-types';

export default function HighlightedText({ text, highlights, user=false }) {

  const getOpacity = (count) => {
    if (user) return 0.5;
    if (count <= 3) return 0.25;
    if (count <= 6) return 0.5;
    if (count <= 9) return 0.75;
    return 1;
  };

  const sorted = [...highlights].sort((a, b) => a.start - b.start);
  const fragments = [];
  let pointer = 0;
  sorted.forEach(({ start, end, coverCount }) => {
    if (pointer < start) {
      fragments.push({ text: text.slice(pointer, start), highlight: false });
    }
    fragments.push({
      text: text.slice(start, end),
      highlight: true,
      opacity: getOpacity(coverCount)
    });
    pointer = end;
  });
  if (pointer < text.length) {
    fragments.push({ text: text.slice(pointer), highlight: false });
  }

  const elements = [];
  for (let i = 0; i < fragments.length; i++) {
    const frag = fragments[i];
    if (frag.highlight) {
      elements.push(
        React.createElement(
          'span',
          {
            key: i,
            style: {
              backgroundColor: `rgba(160,110,255,${frag.opacity})`,
              transition: 'background-color 0.3s'
            }
          },
          frag.text
        )
      );
    } else {
      elements.push(
        React.createElement(React.Fragment, { key: i }, frag.text)
      );
    }
  }
  return React.createElement('span', null, elements);
}

// HighlightedText.propTypes = {
//   text: PropTypes.string.isRequired,
//   highlights: PropTypes.arrayOf(
//     PropTypes.shape({
//       start: PropTypes.number.isRequired,
//       end: PropTypes.number.isRequired,
//       coverCount: PropTypes.number.isRequired
//     })
//   ).isRequired,
//   user: PropTypes.bool
// };

