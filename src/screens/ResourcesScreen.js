import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking, Alert } from 'react-native';
import { NB_STYLES, COLORS } from '../styles/theme';

// Mock Database Structure - CLEAN TEMPLATE
const RESOURCES_DB = {
    "1st Year": {
        "Semester 1": {
            "Mathematics-I (M1)": {
                "Notes": [],
                "Question Papers": [],
                "Lab Manuals": []
            },
            "Applied Physics": {
                "Notes": [], "Question Papers": [], "Lab Manuals": []
            }
        },
        "Semester 2": {}
    },
    "2nd Year": {},
    "3rd Year": {},
    "4th Year": {}
};

export default function ResourcesScreen() {
    const [viewStack, setViewStack] = useState(['ROOT']);
    const [currentData, setCurrentData] = useState(RESOURCES_DB);
    const [headerTitle, setHeaderTitle] = useState("Select Year");

    const getCurrentKeys = () => Object.keys(currentData);

    const handleSelect = (key) => {
        const nextData = currentData[key];

        // If nextData is an Array, we are at the end (PDF List)
        if (Array.isArray(nextData)) {
            setViewStack([...viewStack, key]);
            setCurrentData(nextData);
            setHeaderTitle(key);
        } else {
            // Drill down deeper
            setViewStack([...viewStack, key]);
            setCurrentData(nextData);
            setHeaderTitle(key);
        }
    };

    const handleBack = () => {
        if (viewStack.length === 1) return; // Can't go back from ROOT

        const newStack = [...viewStack];
        newStack.pop();

        // Reconstruct data traversal
        let data = RESOURCES_DB;
        let title = "Select Year";

        // Traverse to find the data for the previous level
        for (let i = 1; i < newStack.length; i++) {
            data = data[newStack[i]];
            title = newStack[i];
        }

        setViewStack(newStack);
        setCurrentData(data);
        setHeaderTitle(newStack.length === 1 ? "Select Year" : title);
    };

    const openLink = (url) => {
        Linking.openURL(url).catch(err => Alert.alert("Error", "Couldn't open link"));
    };

    return (
        <View style={NB_STYLES.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                {viewStack.length > 1 && (
                    <TouchableOpacity onPress={handleBack} style={{ marginRight: 15 }}>
                        <Text style={{ fontSize: 30 }}>🔙</Text>
                    </TouchableOpacity>
                )}
                <Text style={NB_STYLES.headerTitle}>{headerTitle}</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                {Array.isArray(currentData) ? (
                    // PDF List View
                    <>
                        {currentData.length === 0 ? (
                            <Text style={{ fontStyle: 'italic', color: '#666', fontSize: 18 }}>No documents found here yet.</Text>
                        ) : (
                            currentData.map((pdf, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[NB_STYLES.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                                    onPress={() => openLink(pdf.url)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[NB_STYLES.subHeader, { fontSize: 18, marginBottom: 5 }]}>📄 {pdf.title}</Text>
                                        <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>DOWNLOAD PDF</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </>
                ) : (
                    // Category Selection View
                    getCurrentKeys().map((key, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[NB_STYLES.btnPrimary, { backgroundColor: index % 2 === 0 ? COLORS.accent : COLORS.warning, alignItems: 'flex-start' }]}
                            onPress={() => handleSelect(key)}
                        >
                            <Text style={[NB_STYLES.btnText, { fontSize: 20 }]}>{key} 👉</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
