import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert, StyleSheet, PanResponder, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NB_STYLES, COLORS } from '../styles/theme';

const WIDTH = Dimensions.get('window').width;
const GRID_SIZE = 4;
const CELL_SIZE = (WIDTH - 60) / GRID_SIZE;
const SPACING = 5;

// Tile Colors
const TILE_COLORS = {
    2: '#EEE4DA',
    4: '#EDE0C8',
    8: '#F2B179',
    16: '#F59563',
    32: '#F67C5F',
    64: '#F65E3B',
    128: '#EDCF72',
    256: '#EDCC61',
    512: '#EDC850',
    1024: '#EDC53F',
    2048: '#EDC22E',
};

export default function GameScreen({ navigation }) {
    const [board, setBoard] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        loadHighScore();
        initGame();
    }, []);

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            saveHighScore(score);
        }
    }, [score]);

    const loadHighScore = async () => {
        const stored = await AsyncStorage.getItem('2048_highscore');
        if (stored) setHighScore(parseInt(stored));
    };

    const saveHighScore = async (val) => {
        await AsyncStorage.setItem('2048_highscore', val.toString());
    };

    const initGame = () => {
        let newBoard = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        newBoard = addRandomTile(newBoard);
        newBoard = addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
    };

    const addRandomTile = (currentBoard) => {
        let emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return currentBoard;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        currentBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
        return currentBoard;
    };

    // --- Movement Logic ---
    const moveLeft = (board_state) => {
        let newBoard = [];
        let scoreAdd = 0;
        let moved = false;

        for (let r = 0; r < GRID_SIZE; r++) {
            let row = board_state[r].filter(val => val !== 0);
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    scoreAdd += row[i];
                    row.splice(i + 1, 1);
                }
            }
            while (row.length < GRID_SIZE) row.push(0);
            if (row.join(',') !== board_state[r].join(',')) moved = true;
            newBoard.push(row);
        }
        return { newBoard, scoreAdd, moved };
    };

    const rotateBoard = (board_state) => {
        let newBoard = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                newBoard[c][GRID_SIZE - 1 - r] = board_state[r][c];
            }
        }
        return newBoard;
    };

    const rotateBoardCounter = (board_state) => {
        let newBoard = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                newBoard[GRID_SIZE - 1 - c][r] = board_state[r][c];
            }
        }
        return newBoard;
    };

    const moveRight = (b) => {
        let temp = rotateBoard(rotateBoard(b));
        let res = moveLeft(temp);
        res.newBoard = rotateBoard(rotateBoard(res.newBoard));
        return res;
    };

    const moveUp = (b) => {
        let temp = rotateBoardCounter(b);
        let res = moveLeft(temp);
        res.newBoard = rotateBoard(res.newBoard);
        return res;
    };

    const moveDown = (b) => {
        let temp = rotateBoard(b);
        let res = moveLeft(temp);
        res.newBoard = rotateBoardCounter(res.newBoard);
        return res;
    };

    const handleMove = (direction) => {
        if (gameOver) return;
        let result;
        if (direction === 'LEFT') result = moveLeft(board);
        else if (direction === 'RIGHT') result = moveRight(board);
        else if (direction === 'UP') result = moveUp(board);
        else if (direction === 'DOWN') result = moveDown(board);

        if (result.moved) {
            let nextBoard = addRandomTile(result.newBoard);
            setBoard(nextBoard);
            setScore(score + result.scoreAdd);
            checkGameOver(nextBoard);
        }
    };

    const checkGameOver = (b) => {
        // Check for empty cells
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (b[r][c] === 0) return;
            }
        }
        // Check for merges
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (c < GRID_SIZE - 1 && b[r][c] === b[r][c + 1]) return;
                if (r < GRID_SIZE - 1 && b[r][c] === b[r + 1][c]) return;
            }
        }
        setGameOver(true);
        Alert.alert("Game Over!", `Score: ${score}`, [{ text: "Try Again", onPress: initGame }]);
    };

    // Swipe Responder
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderRelease: (evt, gestureState) => {
            const { dx, dy } = gestureState;
            if (Math.abs(dx) > Math.abs(dy)) {
                if (Math.abs(dx) > 20) {
                    handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
                }
            } else {
                if (Math.abs(dy) > 20) {
                    handleMove(dy > 0 ? 'DOWN' : 'UP');
                }
            }
        }
    });

    return (
        <SafeAreaView style={[NB_STYLES.container, { justifyContent: 'center' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <View>
                    <Text style={[NB_STYLES.headerTitle, { fontSize: 40, marginBottom: 0 }]}>2048</Text>
                    <Text style={{ fontWeight: 'bold', color: '#666' }}>Swipe to join numbers</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold' }}>SCORE</Text>
                    <Text style={{ fontSize: 24, fontWeight: '900' }}>{score}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>BEST: {highScore}</Text>
                </View>
            </View>

            <View style={styles.gridContainer} {...panResponder.panHandlers}>
                {board.map((row, rIndex) => (
                    <View key={rIndex} style={{ flexDirection: 'row' }}>
                        {row.map((cell, cIndex) => (
                            <View key={`${rIndex}-${cIndex}`} style={[styles.cell, { backgroundColor: cell === 0 ? '#CDC1B4' : (TILE_COLORS[cell] || '#3C3A32') }]}>
                                {cell !== 0 && (
                                    <Text style={[styles.cellText, { color: cell > 4 ? '#fff' : '#776E65' }]}>
                                        {cell}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
                {gameOver && (
                    <View style={styles.overlay}>
                        <Text style={{ fontSize: 40, fontWeight: '900', color: '#fff' }}>Game Over!</Text>
                        <TouchableOpacity style={NB_STYLES.btnPrimary} onPress={initGame}>
                            <Text style={NB_STYLES.btnText}>TRY AGAIN</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TouchableOpacity style={[NB_STYLES.btnSecondary, { marginTop: 30 }]} onPress={() => navigation.goBack()}>
                <Text style={NB_STYLES.btnText}>EXIT GAME</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        width: WIDTH - 40,
        height: WIDTH - 40,
        backgroundColor: '#BBADA0',
        borderRadius: 10,
        padding: SPACING,
        justifyContent: 'space-between',
        borderWidth: 4,
        borderColor: '#000',
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: 4,
        margin: SPACING / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)'
    },
    cellText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6
    }
});
