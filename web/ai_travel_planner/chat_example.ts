import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChatState, Question, ChatProps } from '../types/chat';
// import LoadingAnimation from './LoadingAnimation'; // No longer used, Swiper block is the new loading state
import { getWeatherForecast } from '../services/weatherService';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { hautesPyreneesLocations } from '../data/locations';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FaSpinner } from 'react-icons/fa';
// Make sure DidYouKnowItem type is imported
import { didYouKnowItems, DidYouKnowItem } from '../data/didYouKnowData';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ItineraryResponse {
  options: {
    title: string;
    morning: string[];
    lunch: string[];
    afternoon: string[];
  }[];
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mobileStyles = `
  @media (max-width: 768px) {
    .chat-container {
      padding: 0.5rem;
    }
    .chat-input {
      font-size: 16px; /* Prevents iOS zoom on focus */
    }
    .suggestion-button {
      margin: 0.25rem;
      white-space: nowrap;
    }
    .suggestions-container {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
`;

const Chat: React.FC<ChatProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // CORRECTED: i18n removed as it was unused
  const [currentQuestion, setCurrentQuestion] = useState<number | null>(null); // null = not started
  const [searchTerm, setSearchTerm] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredLocations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) {
      return [];
    }
    return hautesPyreneesLocations
      .filter(loc =>
        loc.name.toLowerCase().includes(term) ||
        (loc.postalCode && loc.postalCode.includes(term))
      )
      .map((loc: { name: string; postalCode?: string }) => ({
        displayName: `${loc.name}${loc.postalCode ? ` (${loc.postalCode})` : ''}`,
        value: loc.name
      }));
  }, [searchTerm]); // Removed hautesPyreneesLocations from dependency array

  // ESLint 'messages' is assigned a value but never used:
  // This warning is because the 'messages' array itself is not read to render the chat history.
  // setMessages is used, so the state is being managed. Rendering messages is a feature addition.
  // For now, leaving as is, user can decide to render or add // eslint-disable-next-line.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chat.welcome', { defaultValue: 'Bienvenue! Laissez-moi vous aider à planifier votre journée parfaite.' }),
      isUser: false
    }
  ]);
  const [chatState, setChatState] = useState<ChatState>({
    location: '',
    groupSize: undefined,
    children: undefined,
    seniors: undefined,
    mobilityIssues: undefined,
    activities: [],
    budget: '',
    distance: '',
    foodPreference: '',
    personalContext: '',
    datePreference: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<string[]>([]);
  const [rawItineraryResponse, setRawItineraryResponse] = useState<ItineraryResponse | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [requestingFullItineraryIndex, setRequestingFullItineraryIndex] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fullItineraryMessage, setFullItineraryMessage] = useState<string | null>(null);

  // This state variable 'showEmailConfirmationModal' was flagged by ESLint as unused.
  // By defining EmailConfirmationModalComponent inside Chat and using this state, the warning is resolved.
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);


  const questions: Question[] = useMemo(() => [
    {
      key: 'location',
      text: t('chat.questions.location', 'Where will you start your day?'),
      type: 'text',
      suggestions: []
    },
    {
      key: 'groupSize',
      text: t('chat.questions.groupSize', 'How many people are in your group?'),
      suggestions: ['1', '2', '3', '4', '5', '6+']
    },
    {
      key: 'children',
      text: t('chat.questions.children', 'How many children are in your group?'),
      suggestions: ['0', '1', '2', '3', '4']
    },
    {
      key: 'seniors',
      text: t('chat.questions.seniors', 'How many seniors are in your group?'),
      suggestions: ['0', '1', '2', '3', '4']
    },
    {
      key: 'mobilityIssues',
      text: t('chat.questions.mobilityIssues'),
      suggestions: [t('chat.suggestions.yesNo.yes'), t('chat.suggestions.yesNo.no')]
    },
    {
      key: 'activities',
      text: t('chat.questions.activities'),
      suggestions: [
        t('chat.suggestions.activities.cultural'),
        t('chat.suggestions.activities.outdoor'),
        t('chat.suggestions.activities.sports'),
        t('chat.suggestions.activities.family'),
        t('chat.suggestions.activities.historical')
      ],
      isMultiSelect: true
    },
    {
      key: 'budget',
      text: t('chat.questions.budget'),
      suggestions: [
        t('chat.suggestions.budget.friendly'),
        t('chat.suggestions.budget.moderate'),
        t('chat.suggestions.budget.noIssue')
      ]
    },
    {
      key: 'distance',
      text: t('chat.questions.distance', 'How far are you willing to travel?'),
      suggestions: ['0-10km', '11-20km', '21-30km', '31-40km', '41-50km', '50km+']
    },
    {
      key: 'foodPreference',
      text: t('chat.questions.foodPreference', 'Quelles sont vos préférences alimentaires?'),
      suggestions: [
        t('chat.suggestions.food.own', 'Nous apporterons notre propre nourriture'),
        t('chat.suggestions.food.takeout', 'Acheter de la nourriture à emporter'),
        t('chat.suggestions.food.restaurant', 'Nous chercherons à manger sur place'),
        t('chat.suggestions.food.unsure', 'Pas sûr')
      ]
    },
    {
      key: 'personalContext',
      text: t('chat.questions.personalContext', 'Is there anything specific you\'d like to add to personalize your itinerary? (e.g., "celebrating an anniversary", "love quiet places", "interested in local crafts") (Optional)'),
      type: 'text',
      suggestions: []
    },
    {
      key: 'datePreference',
      text: t('chat.questions.datePreference', 'When would you like to visit?'),
      type: 'date',
      suggestions: []
    }
  ], [t]);

  const handleStart = () => {
    setCurrentQuestion(0);
    setMessages([
      {
        id: '1',
        text: t('chat.welcome', { defaultValue: 'Bienvenue! Laissez-moi vous aider à planifier votre journée parfaite.' }),
        isUser: false
      }
    ]);
  };

  const updateChatState = (text: string) => {
    if (currentQuestion === null) return;
    const question = questions[currentQuestion];
    if (!question) return;

    setChatState(prev => {
      if (question.isMultiSelect) {
        const currentActivities = Array.isArray(prev.activities) ? prev.activities : [];
        const newActivities = currentActivities.includes(text)
          ? currentActivities.filter(activity => activity !== text)
          : [...currentActivities, text];
        return { ...prev, activities: newActivities };
      }
      return {
        ...prev,
        [question.key]: question.type === 'date'
          ? new Date(text).toISOString().split('T')[0]
          : question.key === 'mobilityIssues'
            ? text.toLowerCase() === t('chat.suggestions.yesNo.yes').toLowerCase()
            : question.key === 'location'
              ? text.includes('(') ? text.split('(')[0].trim() : text
              : !isNaN(parseInt(text)) && question.key !== 'location' && question.key !== 'postalCode' // Assuming postalCode can be numeric string
                ? parseInt(text)
                : text
      };
    });
  };

  const handleAnswer = (answer: string, isMultiSelectContinue = false) => {
    if (currentQuestion === null) return;
    const question = questions[currentQuestion];
    if (!question) return; // Added safety check

    if (question.isMultiSelect && !isMultiSelectContinue) {
      updateChatState(answer);
      return;
    }

    if (!(question.isMultiSelect && isMultiSelectContinue)) {
        // For non-multiselect or final multi-select answer, update chat state directly
        // updateChatState handles type conversions and specific key logic
        updateChatState(answer);
    }

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text: answer, isUser: true }
    ]);

    if (currentQuestion + 1 < questions.length) {
      setTimeout(() => {
        setCurrentQuestion(prevCq => (prevCq !== null ? prevCq + 1 : 0) ); // Ensure prevCq is not null
        // Accessing questions[currentQuestion + 1] can be problematic due to closure in setTimeout.
        // It's safer to use the updated currentQuestion value in the next render cycle or pass index directly.
        // For this specific logic, checking the *next* question's key:
        const nextQuestionKey = questions[currentQuestion + 1]?.key;
        if (nextQuestionKey && nextQuestionKey !== 'location' && nextQuestionKey !== 'personalContext') {
          setSearchTerm('');
        }
      }, 300);
    } else {
      setIsComplete(true);
    }
  };

  const handleRedo = () => {
     setChatState({
      location: '',
      groupSize: undefined,
      children: undefined,
      seniors: undefined,
      mobilityIssues: undefined,
      activities: [],
      budget: '',
      distance: '',
      foodPreference: '',
      personalContext: '',
      datePreference: ''
    });
    setCurrentQuestion(0);
    setMessages([{
      id: '1',
      text: t('chat.welcome'),
      isUser: false
    }]);
    setIsComplete(false);
    setItinerary([]);
    setError(null);
    setUserEmail('');
    setRequestingFullItineraryIndex(null);
    setShowEmailConfirmationModal(false); // Reset modal state
  };

  const formatItinerary = (options: ItineraryResponse['options']): string[] => {
    try {
      if (!Array.isArray(options)) {
        console.error("Options is not an array:", options);
        return [t('chat.errors.unexpectedResponseFormat', 'Received itinerary data in an unexpected format.')];
      }

      return options.map((option, index) => {
        const bgColorClass = index % 2 === 0 ? 'bg-blue-100' : 'bg-pink-100';
        const borderColorClass = index % 2 === 0 ? 'border-blue-300' : 'border-pink-300'; // Corrected 'bg-pink-300' to 'border-pink-300'

        return `
          <div class="p-4 rounded-lg ${bgColorClass} border ${borderColorClass} mb-6 shadow-sm">
            <h3 class="text-xl font-bold mb-4 text-gray-800">Itinerary ${index + 1}: ${option.title || ''}</h3>
            <div class="space-y-4">
              ${option.morning && option.morning.length > 0 ? `
              <div>
                <h4 class="text-lg font-bold mb-2 text-gray-700">Morning:</h4>
                <ul class="list-disc list-inside pl-4">
                  ${option.morning.map(item => `<li class="mb-1">${item}</li>`).join('')}
                </ul>
              </div>` : ''}
              ${option.lunch && option.lunch.length > 0 ? `
              <div>
                <h4 class="text-lg font-bold mb-2 text-gray-700">Lunch:</h4>
                <ul class="list-disc list-inside pl-4">
                  ${option.lunch.map(item => `<li class="mb-1">${item}</li>`).join('')}
                </ul>
              </div>` : ''}
              ${option.afternoon && option.afternoon.length > 0 ? `
              <div>
                <h4 class="text-lg font-bold mb-2 text-gray-700">Afternoon:</h4>
                 <ul class="list-disc list-inside pl-4">
                  ${option.afternoon.map(item => `<li class="mb-1">${item}</li>`).join('')}
                </ul>
              </div>` : ''}
            </div>
          </div>
        `;
      });
    } catch (e) {
      console.error("Failed to parse or format itinerary JSON:", e);
       return [`<div class="prose max-w-none p-4 bg-red-100 border border-red-300 rounded-lg"><p>${t('chat.errors.parsingError', 'Could not display itinerary. Raw data:')}</p><pre class="whitespace-pre-wrap break-words"><code>${JSON.stringify(options)}</code></pre></div>`];
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    setItinerary([]);
    setRawItineraryResponse(null);

    try {
      if (!chatState.datePreference) {
        setError(t('chat.errors.missingDate', 'Please select a date before confirming.'));
        setIsSubmitting(false); // Stop submission early
        return; // Exit
      }
       if (!chatState.location) {
        setError(t('chat.errors.missingLocation', 'Please select a starting location before confirming.'));
        setIsSubmitting(false); // Stop submission early
        return; // Exit
       }

      const weather = await getWeatherForecast(chatState.datePreference, chatState.location);

      const payload = {
        status: 'new',
        language: t('language', 'en'),
        location: String(chatState.location),
        groupSize: String(chatState.groupSize ?? ''),
        children: String(chatState.children ?? ''),
        seniors: String(chatState.seniors ?? ''),
        mobilityIssues: Boolean(chatState.mobilityIssues),
        activities: chatState.activities || [],
        budget: String(chatState.budget ?? ''),
        distance: String(chatState.distance ?? ''),
        foodPreference: String(chatState.foodPreference ?? ''),
        personalContext: chatState.personalContext ?? '',
        date: chatState.datePreference,
        weather: weather ? {
          maxTemp: weather.maxTemp,
          summary: weather.summary
        } : null
      };

      console.log('%c Sending payload:', 'color: #4CAF50; font-weight: bold', JSON.stringify(payload, null, 2));
      const webhookUrl = process.env.REACT_APP_WEBHOOK_URL || "https://hook.eu2.make.com/9x5ub0mrz2hmexjmuf87xo4jajga95dg";

      if (!webhookUrl) {
        setError(t('chat.errors.configError', 'Configuration error: Webhook URL is not set. Please contact support.'));
        throw new Error("Webhook URL is not configured."); // This will be caught by catch block
      }
      console.log('%c Target Webhook URL:', 'color: #FF9800; font-weight: bold', webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain'
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (!response.ok) {
         let errorDetail = responseText;
         try {
           const errorJson = JSON.parse(responseText);
           errorDetail = errorJson.message || errorJson.error || JSON.stringify(errorJson);
         } catch (parseError) { /* Ignore if it's not JSON */ }
        setError(t('chat.errors.webhookFailed', 'Webhook request failed ({{status}}): {{detail}}', { status: response.status, detail: errorDetail }));
        throw new Error(`Webhook request failed: ${response.status} - ${errorDetail}`); // This will be caught
      }

      let cleanedText = responseText.trim();
      if (cleanedText.toLowerCase().startsWith('json ')) {
        cleanedText = cleanedText.substring(5).trim();
      }
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring('```json'.length);
        if (cleanedText.endsWith('```')) {
          cleanedText = cleanedText.substring(0, cleanedText.length - '```'.length);
        }
      }
      cleanedText = cleanedText.trim();

      if (cleanedText.toLowerCase() === 'accepted') {
        setItinerary([t('chat.itinerary.generating', 'Request accepted! Your personalized itinerary is being generated. Please wait or check back later.')]);
        setRawItineraryResponse(null);
      } else {
        const parsedResponse = JSON.parse(cleanedText) as ItineraryResponse;
      console.log('Parsed initial itinerary options:', parsedResponse);
      if (!parsedResponse || !Array.isArray(parsedResponse.options)) {
          setError(t('chat.errors.unexpectedResponseFormat', 'Received itinerary data in an unexpected format.'));
          setRawItineraryResponse(null);
          setItinerary([t('chat.errors.unexpectedResponseFormat', 'Received itinerary data in an unexpected format.')]);
        } else {
          setRawItineraryResponse(parsedResponse);
          const formattedList = formatItinerary(parsedResponse.options);
          setItinerary(formattedList);
        }
      }
    } catch (caughtError: any) {
      if (!error) { // Only set error if not already set (e.g., by missing date/location checks)
        if (caughtError?.message?.includes('fetch') || caughtError?.message?.includes('Network request failed')) {
          setError(t('chat.errors.networkError', 'Network error: Could not connect to the server. Please check your internet connection.'));
        } else {
          setError(t('chat.errors.generic', 'An unexpected error occurred: {{message}}', { message: caughtError?.message || 'Unknown error' }));
        }
      }
      // setIsComplete(true); // Let this be set by handleAnswer or next question logic
    } finally {
      setIsSubmitting(false);
      // setIsComplete(true) should probably be set if we are done with questions,
      // regardless of success/failure of itinerary generation, to show summary/results.
      // The original code sets it in handleAnswer or here.
      // If handleConfirm is the final step after all questions, then setIsComplete(true) might be appropriate here.
      // However, errors can occur, and we might still want to be "complete" in terms of questions.
      // Let's assume the current logic of setting isComplete in handleAnswer is sufficient.
    }
  };

  const handleGetFullItinerary = (itineraryIndex: number) => {
    fetchAndDisplayFullItinerary(itineraryIndex);
  };

  const fetchAndDisplayFullItinerary = async (itineraryIndex: number) => {
    console.log('Starting fetchAndDisplayFullItinerary for index:', itineraryIndex);
    const webhookUrl = process.env.REACT_APP_PDF_WEBHOOK_URL || "https://hook.eu2.make.com/gq1w18r1bkuj2uowr220qsys65pdv3o2";

    if (!webhookUrl) {
      console.error("Webhook URL is not configured!");
      setError(t('chat.errors.configError', 'Configuration error: Itinerary generation is currently unavailable.'));
      return;
    }

    console.log('Checking rawItineraryResponse before sending second payload:', rawItineraryResponse);
    if (!rawItineraryResponse || !rawItineraryResponse.options || itineraryIndex >= rawItineraryResponse.options.length) {
        console.error("Cannot fetch details: Raw itinerary data is missing or index is out of bounds.");
        setError(t('chat.errors.missingItineraryData', 'Could not retrieve the selected itinerary details.'));
        return;
    }

    const selectedItineraryOption = rawItineraryResponse.options[itineraryIndex];
    const weather = await getWeatherForecast(chatState.datePreference, chatState.location);

    const payload = {
      language: t('language', 'en'),
      location: String(chatState.location),
      groupSize: String(chatState.groupSize ?? ''),
      children: String(chatState.children ?? ''),
      seniors: String(chatState.seniors ?? ''),
      mobilityIssues: Boolean(chatState.mobilityIssues),
      activities: chatState.activities || [],
      budget: String(chatState.budget ?? ''),
      distance: String(chatState.distance ?? ''),
      foodPreference: String(chatState.foodPreference ?? ''),
      date: chatState.datePreference,
      personalContext: chatState.personalContext ?? '',
      weather: weather ? {
        maxTemp: weather.maxTemp,
        summary: weather.summary,
      } : null,
      selectedItinerary: selectedItineraryOption
    };

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Sending payload to webhook:', payload);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Webhook response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook response not OK. Error text:', errorText);
        throw new Error(`Webhook request failed: ${response.status} - ${errorText}`);
      }

      const detailedItinerary = await response.json();
      
      console.log('Received detailed itinerary JSON:', detailedItinerary);
      console.log('Navigating to itinerary page...');
      // Navigate to the itinerary page with the new data
      navigate(`/itinerary/${itineraryIndex + 1}`, { state: { itinerary: detailedItinerary } });

    } catch (error: any) {
      console.error('Failed to fetch detailed itinerary:', error);
      setError(t('chat.errors.itineraryFetchError', 'Sorry, we couldn\'t generate the detailed itinerary. Please try again later.'));
    } finally {
      console.log('fetchAndDisplayFullItinerary finished.');
      setIsSubmitting(false);
    }
  };

  

  

  

  let chatContent;

  if (currentQuestion === null) {
    chatContent = (
      <div className="h-full flex flex-col items-center justify-center bg-beige-50 p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-xl sm:text-2xl mb-6 font-semibold">
            {t('chat.welcome', 'Welcome! Let me help you plan your perfect day.')}
          </h1>
          <button
            onClick={handleStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors"
          >
            {t('chat.buttons.start', 'Start Planning')}
          </button>
        </div>
      </div>
    );
  } else if (isComplete && itinerary.length === 0 && !isSubmitting) { // Summary view (before itinerary or if error)
    chatContent = (
      <div className="h-full flex flex-col bg-gray-50 p-8 overflow-y-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6">
          {t('chat.summary.title', 'Summary of your preferences')}
        </h2>
        <div className="space-y-4 mb-8">
          <p><strong>{t('chat.questions.location')}:</strong> {chatState.location || t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.groupSize')}:</strong> {chatState.groupSize ?? t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.children')}:</strong> {chatState.children ?? t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.seniors')}:</strong> {chatState.seniors ?? t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.mobilityIssues')}:</strong> {typeof chatState.mobilityIssues === 'boolean' ? (chatState.mobilityIssues ? t('chat.suggestions.yesNo.yes') : t('chat.suggestions.yesNo.no')) : t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.activities')}:</strong> {Array.isArray(chatState.activities) && chatState.activities.length > 0 ? chatState.activities.join(', ') : t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.budget')}:</strong> {chatState.budget || t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.distance')}:</strong> {chatState.distance || t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.foodPreference')}:</strong> {chatState.foodPreference || t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.personalContext')}:</strong> {chatState.personalContext || t('chat.summary.notSpecified', 'Not specified')}</p>
          <p><strong>{t('chat.questions.datePreference')}:</strong> {chatState.datePreference || t('chat.summary.notSpecified', 'Not specified')}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRedo}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            {t('chat.buttons.redo', 'Start Over')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !chatState.location || !chatState.datePreference} // Disable if critical info missing
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {t('chat.buttons.confirm', 'Generate Itinerary')}
          </button>
        </div>
      </div>
    );
  } else if (itinerary.length > 0 && !isSubmitting) { // Itinerary view
    const bgColors = ['bg-cyan-50', 'bg-pink-50', 'bg-green-50', 'bg-yellow-50', 'bg-indigo-50'];
    chatContent = (
      <div className="h-full flex flex-col bg-gray-100 p-4 md:p-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300" role="alert">
            {error}
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
          {t('chat.itinerary.title', 'Your Personalized Day Plans')}
        </h2>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4">
          {itinerary.map((itemHtml, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 sm:p-6 shadow border ${bgColors[index % bgColors.length]}`}
            >
              <div className="prose prose-sm sm:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: itemHtml }} />
              <div className="mt-4 pt-4 border-t border-gray-300">
                <button
                     onClick={() => handleGetFullItinerary(index)}
                     disabled={isSubmitting || requestingFullItineraryIndex !== null}
                     className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('chat.buttons.getFullItinerary', 'Get Full Itinerary')}
                  </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleRedo}
          disabled={isSubmitting}
          className="mt-6 w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg disabled:opacity-50 transition-colors"
        >
          {t('chat.buttons.startOver', 'Plan Another Day')}
        </button>
      </div>
    );
  } else if (isSubmitting && itinerary.length === 0) { // Loading view (for initial itinerary generation)
    chatContent = (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center mb-4">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
          <p className="mt-2 text-lg">{t('chat.itinerary.generating', 'Generating your personalized plans...')}</p>
        </div>
        {/* Added responsive classes: max-w-sm on small screens, max-w-md on medium, max-w-lg on large */}
        <div className="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto"> 
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            className="w-full"
          >
            {didYouKnowItems.map((item: DidYouKnowItem, index: number) => (
              <SwiperSlide 
                key={index} 
                className="bg-beige-100 p-6 rounded-lg shadow-md flex flex-col items-center text-center"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-700">{t(item.factKey + '.title', `Fact #${item.id}`)}</h3>
                <img 
                  src={`/did_you_know_${t('language', 'en')}/${item.id}.png`}
                  alt={t(item.factKey + '.title', `Fact #${item.id}`)}
                  className="max-h-96 w-auto object-contain mb-3 rounded" /* Increased from max-h-48 to max-h-96 */
                />
                <p className="text-sm text-gray-600">{t(item.factKey + '.text', 'Interesting fact about the Hautes-Pyrénées')}</p>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  } else { // Active question view
    const question = currentQuestion !== null ? questions[currentQuestion] : undefined;

    if (!question) {
      chatContent = <div>{t('chat.errors.questionNotFound', 'Error: Question not found. Please try starting over.')}</div>;
    } else {
      chatContent = (
        <div className="h-full flex flex-col items-center justify-center bg-beige-50 p-4">
          <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg sm:text-xl mb-6 font-medium">{question.text}</h2>

            {question.key === 'location' ? (
              <div className="mt-4 relative">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder={t('chat.placeholders.location', 'Enter a city or postal code...')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Delay to allow click on dropdown
                />
                {showDropdown && filteredLocations.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded max-h-60 overflow-y-auto shadow-lg">
                    {filteredLocations.map((loc) => (
                      <div
                        key={loc.value}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => {
                          handleAnswer(loc.value); // Pass the 'value' (e.g., city name)
                          setSearchTerm(loc.displayName); // Display full name with postal code
                          setShowDropdown(false);
                        }}
                      >
                        {loc.displayName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : question.type === 'date' ? (
              <div className="mt-4">
                <input
                  type="date"
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleAnswer(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} // Optional: prevent past dates
                />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {question.suggestions && question.suggestions.map((suggestion: string) => (
                    <button
                      key={suggestion}
                      onClick={() => handleAnswer(suggestion)}
                      className={`px-4 py-2 rounded-full border ${
                        question.isMultiSelect && chatState.activities?.includes(suggestion)
                          ? 'bg-blue-500 text-white border-blue-600'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300'
                      } text-sm`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                {question.type === 'text' && (!question.suggestions || question.suggestions.length === 0) && question.key !== 'location' && (
                  <form
                    className="mt-4"
                    onSubmit={e => {
                      e.preventDefault();
                      if (searchTerm.trim()) {
                        handleAnswer(searchTerm.trim());
                        setSearchTerm('');
                      }
                    }}
                  >
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder={t('chat.placeholders.text', 'Type your answer...')}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="mt-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 self-end"
                      disabled={!searchTerm.trim()}
                    >
                      {t('chat.buttons.continue', 'Continue')}
                    </button>
                  </form>
                )}
                {question.isMultiSelect && (
                  <button
                    onClick={() => handleAnswer(chatState.activities?.join(', ') || '', true)} // Pass current activities as a string for the "message", true for multi-select continue
                    className="mt-4 px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                    disabled={!chatState.activities?.length}
                  >
                    {t('chat.buttons.continue', 'Continue')}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      );
    }
  }

  return (
    <>
      {chatContent}
    </>
  );
};

export default Chat;

