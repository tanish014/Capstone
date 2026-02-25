import './Toolbar.css';

const PRESET_COLORS = [
    '#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
    '#9b59b6', '#ff9ff3', '#54a0ff', '#00d2d3', '#ff6348'
];

const Toolbar = ({ tool, setTool, color, setColor, brushSize, setBrushSize, onUndo, onRedo, onClear, isHost }) => {
    return (
        <aside className="toolbar">
            <div className="toolbar-section">
                <label className="toolbar-label">Tools</label>
                <button
                    className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
                    onClick={() => setTool('pencil')}
                    title="Pencil"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                    </svg>
                </button>
                <button
                    className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                    onClick={() => setTool('eraser')}
                    title="Eraser"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.2 2a2 2 0 012.8 0L21.8 7a2 2 0 010 2.8L10 21" />
                    </svg>
                </button>
            </div>

            <div className="toolbar-section">
                <label className="toolbar-label">Color</label>
                <div className="color-grid">
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            className={`color-swatch ${color === c ? 'active' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                            title={c}
                        />
                    ))}
                </div>
                <div className="custom-color">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        title="Custom color"
                    />
                </div>
            </div>

            <div className="toolbar-section">
                <label className="toolbar-label">Size: {brushSize}px</label>
                <input
                    type="range"
                    min="1"
                    max="30"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="size-slider"
                />
                <div className="size-preview">
                    <div
                        className="size-dot"
                        style={{
                            width: brushSize,
                            height: brushSize,
                            backgroundColor: tool === 'eraser' ? '#666' : color
                        }}
                    />
                </div>
            </div>

            <div className="toolbar-section toolbar-actions">
                <label className="toolbar-label">Actions</label>
                <button className="tool-btn action-btn" onClick={onUndo} title="Undo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <polyline points="1,4 1,10 7,10" />
                        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                    </svg>
                </button>
                <button className="tool-btn action-btn" onClick={onRedo} title="Redo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <polyline points="23,4 23,10 17,10" />
                        <path d="M20.49 15a9 9 0 11-2.13-9.36L23 10" />
                    </svg>
                </button>
                {isHost && (
                    <button className="tool-btn action-btn clear-btn" onClick={onClear} title="Clear Board (Host Only)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <polyline points="3,6 5,6 21,6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Toolbar;
