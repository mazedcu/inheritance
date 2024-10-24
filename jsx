



const { useState } = React;

const App = () => {
  // State to track if the 3rd and 4th tiles should be hidden and if fractions should appear
  const [state, setState] = useState({
    hidden: false,
    showFractions: false,
  });

  const handleClick = () => {
    // When the 1st tile is clicked, hide the 3rd and 4th tiles and show fractions under 5th and 6th
    setState({
      hidden: true,
      showFractions: true,
    });
  };

  const handleReset = () => {
    // Reset the state to make all tiles visible and remove fractions
    setState({
      hidden: false,
      showFractions: false,
    });
  };

  const tiles = [
    'Tile 1', 'Tile 2', 'Tile 3', 'Tile 4', 
    'Tile 5', 'Tile 6', 'Tile 7', 'Tile 8', 
    'Tile 9', 'Tile 10', 'Tile 11', 'Tile 12'
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '20px' }}>
        {tiles.map((tile, index) => {
          return (
            <div
              key={index}
              className={`tile ${state.hidden && (index === 2 || index === 3) ? 'vanish' : ''}`}
              style={{
                backgroundColor: 'lightblue',
                padding: '20px',
                textAlign: 'center',
                fontSize: '18px',
                border: '2px solid black',
                cursor: 'pointer',
                animation: `float 3s ease-in-out infinite`,
                animationDelay: `${index * 0.3}s`,
              }}
              onClick={index === 0 ? handleClick : null}  // Add click event only to the 1st tile
            >
              {tile}
              {/* Show fractions below the 5th and 6th tile */}
              {(index === 4 || index === 5) && state.showFractions && (
                <div style={{ marginTop: '10px', fontSize: '16px', color: 'darkblue' }}>
                  1/2
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={handleReset} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Reset
        </button>
      </div>
    </div>
  );
};

// Render the App component into the DOM
ReactDOM.render(<App />, document.getElementById('root'));


