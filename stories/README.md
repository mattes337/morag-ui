# Morag UI Storybook

This Storybook contains comprehensive interactive stories for the Morag UI application, including simulated event handling and complete workflow demonstrations.

## 🎯 Key Features

### Interactive Stage Processing Simulation
- **Stage Control Panel**: Complete simulation of document processing stages
- **2-second execution delays**: Realistic timing for stage completion
- **Progress indicators**: Real-time progress updates during stage execution
- **Chain execution**: Automatic execution of multiple stages in sequence
- **Error handling**: Simulation of failed stages and recovery

### Complete Application Flow
- **Full App Simulation**: End-to-end user journey from realm selection to document processing
- **Mock Data**: Comprehensive mock data for realms and documents
- **State Management**: Realistic state transitions and updates
- **Event Handling**: Complete simulation of all user interactions

### Fixed Layout Issues
- **Horizontal Workflow**: Past/future stages displayed as compact vertical columns
- **Rotated Text**: 90-degree rotated text for stage names in compact view
- **Current Stage Highlight**: Full card display for the currently active stage
- **Responsive Design**: Proper layout across different screen sizes

## 📚 Story Categories

### Components
- **StageControlPanel**: Interactive stage execution with simulation
- **StageWorkflowView**: Horizontal workflow layout with compact stage display
- **StageCard**: Individual stage components with all states
- **ProcessingStatusDisplay**: Status indicators and progress tracking

### Views
- **RealmsView**: Complete realm management interface with mock data
- **DocumentsView**: Document listing with various processing states
- **DocumentDetailView**: Detailed document view with processing simulation

### App Simulation
- **Full Application Flow**: Complete app simulation addressing the issues:
  - ✅ Displays realms for admin users (mock data provided)
  - ✅ Shows documents in selected realms
  - ✅ Simulates complete processing workflow
  - ✅ Demonstrates all user interactions

## 🚀 How to Use

### Running Storybook
```bash
npm run storybook
```

### Testing Interactive Features

#### Stage Processing Simulation
1. Navigate to `Components/StageControlPanel/Interactive Simulation`
2. Click "Execute" on MARKDOWN_CONVERSION to start
3. Watch the 2-second simulation with progress updates
4. Use "Execute Chain" to run all remaining stages
5. Try "Reset to Stage" to reset progress
6. Toggle between MANUAL and AUTOMATIC modes

#### Full Application Flow
1. Navigate to `App/Full Application Simulation`
2. Start with realm selection (mock admin realm available)
3. Click on a realm to view documents
4. Click on a document to view details
5. Use the processing controls to simulate stage execution
6. Watch the debug panel for state changes

### Key Interactive Stories

#### 1. Stage Control Panel - Interactive Simulation
- **Path**: `Components/StageControlPanel/Interactive Simulation`
- **Features**: Complete stage execution simulation with 2s delays
- **Testing**: Execute individual stages or chains, watch progress

#### 2. Stage Workflow View - Horizontal Demo
- **Path**: `Components/StageWorkflowView/Horizontal Workflow Demo`
- **Features**: New horizontal layout with compact vertical stage display
- **Testing**: View past/future stages as compact columns with rotated text

#### 3. Full Application Flow
- **Path**: `App/Full Application Simulation`
- **Features**: Complete app simulation with mock data
- **Testing**: Navigate through realms → documents → processing

## 🔧 Technical Implementation

### Mock Data
- **Realms**: Admin realm (morag.drydev.de) with proper user roles
- **Documents**: 8 sample documents in various processing states
- **Stages**: Complete stage configuration with all possible states

### Simulation Features
- **Async Operations**: Proper async/await for realistic timing
- **State Management**: React hooks for state transitions
- **Progress Tracking**: Real-time progress updates (0-100%)
- **Error Simulation**: Random failures and recovery scenarios

### Layout Fixes
- **Horizontal Workflow**: Fixed grid layout to horizontal flow
- **Compact Stages**: Past/future stages as 64px wide columns
- **Vertical Text**: CSS transform for 90-degree rotation
- **Current Stage**: Full card display for active stage

## 🐛 Issues Addressed

### ✅ Past/Future Stages Display
- **Problem**: Stages were displayed in grid columns
- **Solution**: Horizontal layout with compact vertical columns
- **Implementation**: CSS transforms for text rotation

### ✅ No Realms Displayed for Admin
- **Problem**: Empty realm list in Storybook
- **Solution**: Mock admin realm data with proper configuration
- **Implementation**: Comprehensive mock data in stories

### ✅ No Documents Displayed
- **Problem**: Empty document list
- **Solution**: Mock document data with various states
- **Implementation**: 8 sample documents with realistic data

### ✅ Event Handling Simulation
- **Problem**: No interactive stage execution
- **Solution**: Complete simulation with 2s delays and progress
- **Implementation**: Async functions with state updates

## 🎨 Visual Features

### Stage States
- **PENDING**: Gray with pending icon
- **RUNNING**: Blue with progress indicator
- **COMPLETED**: Green with checkmark
- **FAILED**: Red with error icon
- **SKIPPED**: Gray with skip indicator

### Layout Improvements
- **Compact Columns**: 64px wide for past/future stages
- **Rotated Text**: Stage names displayed vertically
- **Progress Bars**: Real-time progress during execution
- **Status Indicators**: Color-coded status badges

## 📖 Documentation

Each story includes:
- **Description**: Clear explanation of functionality
- **Usage Instructions**: Step-by-step testing guide
- **Debug Information**: Real-time state display
- **Interactive Controls**: Buttons and controls for testing

## 🔄 Continuous Updates

The Storybook is designed to be easily extensible:
- Add new mock data scenarios
- Extend simulation features
- Add new interactive controls
- Enhance visual feedback

For questions or improvements, refer to the individual story documentation or the component source code.
