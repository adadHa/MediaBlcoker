# MediaBlocker

## Project Description

MediaBlocker is a Chrome extension designed to give users control over media content on websites. It allows users to block or blur images and videos on specified sites, providing a customizable browsing experience. Users can adjust the level of blur and transparency for media elements and maintain a list of allowed sites where media is not blocked.

## Installation Steps

1. **Prerequisites**:
   - Ensure you have Google Chrome installed on your computer.

2. **Installation**:
   - Clone the repository to your local machine:
     ```bash
     git clone https://github.com/adadHa/MediaBlcoker.git
     ```
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable "Developer mode" by toggling the switch in the top right corner.
   - Click on "Load unpacked" and select the `MediaBlocker_SourceFiles` directory from the cloned repository.

## Usage Instructions

- Once installed, the MediaBlocker icon will appear in the Chrome toolbar.
- Click the icon to open the settings popup.
- Use the "Allow/Block Current Site" button to toggle media blocking for the current site.
- Adjust the "Max Blur" and "Max Transparency" sliders to customize how media is displayed.
- The status of the current site (allowed or blocked) is displayed in the popup.
- A list of allowed sites is maintained and can be viewed in the popup.

## Dependencies

- **Chrome**: The extension is designed to work with Google Chrome. Ensure you have the latest version for optimal performance.
- **Permissions**: The extension requires permissions to access active tabs and storage to function correctly.

## Additional Information

- **Contributing**: Contributions are welcome! Please fork the repository and submit a pull request with your changes.
- **Support**: For any issues or questions, please open an issue on the GitHub repository.

This README provides all necessary information to set up and use the MediaBlocker extension effectively. For further details, refer to the source code and comments within the project files.
