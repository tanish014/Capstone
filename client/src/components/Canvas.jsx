import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import './Canvas.css';

const Canvas = forwardRef(({ tool, color, brushSize, roomId, socket, emit, on, off }, ref) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const isDrawing = useRef(false);
    const lastPoint = useRef(null);
    const [strokes, setStrokes] = useState([]);
    const [currentStroke, setCurrentStroke] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const throttleTimer = useRef(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctxRef.current = ctx;

        const handleResize = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.putImageData(imageData, 0, 0);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        clearCanvas: () => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setStrokes([]);
            setRedoStack([]);
        },
        undo: () => {
            if (strokes.length === 0) return;
            const newStrokes = [...strokes];
            const removed = newStrokes.pop();
            setStrokes(newStrokes);
            setRedoStack(prev => [...prev, removed]);
            redrawCanvas(newStrokes);
        },
        redo: () => {
            if (redoStack.length === 0) return;
            const newRedo = [...redoStack];
            const restored = newRedo.pop();
            setRedoStack(newRedo);
            setStrokes(prev => [...prev, restored]);
            redrawCanvas([...strokes, restored]);
        },
        getSnapshot: () => {
            return canvasRef.current.toDataURL('image/png');
        }
    }));

    const redrawCanvas = useCallback((allStrokes) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        allStrokes.forEach(stroke => {
            if (stroke.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = stroke.tool === 'eraser' ? '#1a1a2e' : stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
        });
    }, []);

    // Listen for remote draw events
    useEffect(() => {
        if (!socket.current) return;

        const handleRemoteDraw = (data) => {
            const ctx = ctxRef.current;
            if (!ctx) return;
            ctx.beginPath();
            ctx.strokeStyle = data.tool === 'eraser' ? '#1a1a2e' : data.color;
            ctx.lineWidth = data.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(data.prevX, data.prevY);
            ctx.lineTo(data.x, data.y);
            ctx.stroke();
        };

        const handleRemoteStrokeComplete = (data) => {
            setStrokes(prev => [...prev, data.stroke]);
        };

        const handleRemoteClearBoard = () => {
            const canvas = canvasRef.current;
            const ctx = ctxRef.current;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setStrokes([]);
            setRedoStack([]);
        };

        const handleRemoteUndo = () => {
            setStrokes(prev => {
                const newStrokes = [...prev];
                if (newStrokes.length > 0) newStrokes.pop();
                redrawCanvas(newStrokes);
                return newStrokes;
            });
        };

        const handleRemoteRedo = () => {
            setRedoStack(prev => {
                if (prev.length === 0) return prev;
                const newRedo = [...prev];
                const restored = newRedo.pop();
                setStrokes(s => {
                    const updated = [...s, restored];
                    redrawCanvas(updated);
                    return updated;
                });
                return newRedo;
            });
        };

        on('draw', handleRemoteDraw);
        on('stroke-complete', handleRemoteStrokeComplete);
        on('clear-board', handleRemoteClearBoard);
        on('undo', handleRemoteUndo);
        on('redo', handleRemoteRedo);

        return () => {
            off('draw', handleRemoteDraw);
            off('stroke-complete', handleRemoteStrokeComplete);
            off('clear-board', handleRemoteClearBoard);
            off('undo', handleRemoteUndo);
            off('redo', handleRemoteRedo);
        };
    }, [socket.current, on, off, redrawCanvas]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const pos = getPos(e);
        isDrawing.current = true;
        lastPoint.current = pos;
        setCurrentStroke([pos]);
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing.current) return;

        const pos = getPos(e);
        const ctx = ctxRef.current;

        ctx.beginPath();
        ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        // Throttle socket emit (~60fps)
        if (!throttleTimer.current) {
            throttleTimer.current = setTimeout(() => {
                emit('draw', {
                    roomId,
                    prevX: lastPoint.current.x,
                    prevY: lastPoint.current.y,
                    x: pos.x,
                    y: pos.y,
                    color,
                    size: brushSize,
                    tool
                });
                throttleTimer.current = null;
            }, 16);
        }

        setCurrentStroke(prev => [...prev, pos]);
        lastPoint.current = pos;
    };

    const stopDrawing = (e) => {
        if (e) e.preventDefault();
        if (!isDrawing.current) return;
        isDrawing.current = false;

        if (currentStroke.length > 0) {
            const stroke = {
                points: currentStroke,
                color,
                size: brushSize,
                tool,
                timestamp: Date.now()
            };
            setStrokes(prev => [...prev, stroke]);
            setRedoStack([]);

            emit('stroke-complete', { roomId, stroke });
        }
        setCurrentStroke([]);
        lastPoint.current = null;
    };

    return (
        <canvas
            ref={canvasRef}
            className={`drawing-canvas ${tool === 'eraser' ? 'eraser-cursor' : 'pencil-cursor'}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
    );
});

Canvas.displayName = 'Canvas';
export default Canvas;
