import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Sender } from "./components/Sender";
import { Receiver } from "./components/Receiver";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/sender" element={<Sender />}></Route>
				<Route path="/reciever" element={<Receiver />}></Route>
			</Routes>
		</BrowserRouter>
	);
};

export default App;
