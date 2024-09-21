import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    dropdownContainer: {
        margin: 16,
    },
    dropdown: {
        backgroundColor: '#fafafa',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    dropdownList: {
        backgroundColor: '#fafafa',
    },
    header: {
        backgroundColor: 'white',
        paddingTop: 80,
        paddingHorizontal: 20,
        paddingBottom: 10,
        justifyContent: "flex-end",
        alignItems: "flex-start",
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    scrollContainer: {
        padding: 20,
        zIndex: -4 //to put review cards behind dropdown
    },
    dropdownContainer: {
        padding: 20,
        zIndex: 10 //to put dropdown in front of review cards
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginVertical: 10,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    content: {
        padding: 15,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    comment: {
        color: '#333',
        fontSize: 16,
        marginTop: 5,
    },
    ratingLocation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    location: {
        color: '#555',
    },
    likesDislikes: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
    },
    likes: {
        marginRight: 20,
        color: '#555',
    },
    dislikes: {
        color: '#555',
    },
});

export default styles;