export const Home = () => {
	return (
		<div className="min-h-screen my-auto bg-gray-800 p-6">
			{/* min-h-screen bg-gray-50 p-6 */}
			<nav className="max-w-md mx-auto bg-white	 rounded-xl shadow-sm p-6 space-y-4">
				<h1 className="text-2xl font-semibold text-gray-800">Video Connection</h1>

				<div className="space-y-3">
					<a
						href="/send"
						target="_blank"
						className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-center"
					>
						<div className="flex items-center justify-center space-x-2">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
								<path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
							</svg>
							<span>Send Video</span>
						</div>
					</a>

					<a
						href="/receive"
						target="_blank"
						className="block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 text-center"
					>
						<div className="flex items-center justify-center space-x-2">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path
									fillRule="evenodd"
									d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
									clipRule="evenodd"
								/>
							</svg>
							<span>Receive Video</span>
						</div>
					</a>
				</div>

				<div className="pt-4 border-t border-gray-100">
					<p className="text-sm text-gray-500 text-center">Video connection app</p>
				</div>
			</nav>
		</div>
	);
};
