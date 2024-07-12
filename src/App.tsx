import { useState, useEffect } from 'react';
import styles from './App.module.scss';
import { addUser, updateUserCoins, getUser, getAllUsers, clearDB } from './Database/db';
import { countries } from './Database/countries';
import Leaderboard from './Components/Leaderboard/Leaderboard';
import populateDB from './Database/populateDB';
import { UserOutlined, TrophyOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import buttonSvg from './assets/button.png';
import moneySvg from './assets/money.png';
import highVoltage from './assets/high-voltage.png';

function App() {

  const [energy, setEnergy] = useState(1000);
  const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);
  const pointsToAdd = 1;
  const energyToReduce = 1;

  const [coinCount, setCoinCount] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [currentView, setCurrentView] = useState<string>('coin');

  useEffect(() => {
    const initializeApp = async () => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
        const user = await getUser(storedUserId);
        if (user) {
          setCoinCount(user.coins);
          setSelectedCountry(user.country);
          const interval = setInterval(() => {
            setEnergy((prevEnergy) => Math.min(prevEnergy + 1, 1000));
          }, 1000); // Restore 10 energy points every second
      
          return () => clearInterval(interval);
        }
      } else {
        const newUserId = 'You';
        localStorage.setItem('userId', newUserId);
        setUserId(newUserId);
      }
    };

    initializeApp();
  }, []);

  const handleButtonClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (energy - energyToReduce < 0) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCoinCount(coinCount + pointsToAdd);
    const newCoinCount = (coinCount + 1);
    setEnergy(energy - energyToReduce < 0 ? 0 : energy - energyToReduce);
    setClicks([...clicks, { id: Date.now(), x, y }]);
    if (userId && selectedCountry) {
      await updateUserCoins(userId, newCoinCount);
    }
    /** 
    const newCoinCount = coinCount + 1;
    setCoinCount(newCoinCount);
    if (userId && selectedCountry) {
      await updateUserCoins(userId, newCoinCount);
    }*/
  };

  const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const users = await getAllUsers();
    if (users.length === 0) {
      await populateDB();
    }
    const country = event.target.value;
    setSelectedCountry(country);
    if (userId) {
      await addUser({ userid: userId, country, coins: 0 });
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('userId');
    await clearDB(); // Clear the IndexedDB database
    setSelectedCountry(null);
    setCoinCount(0);
    setUserId('');
    setCurrentView('coin');
  };

  const renderContent = () => {
    if (!selectedCountry) {
      return (
        <div className={styles.countrySelection}>
          <h1>Select Your Country</h1>
          <select onChange={handleCountryChange} defaultValue="">
            <option value="" disabled>
              Choose your country
            </option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (currentView === 'coin') {
      return (
        <div>
          <div className={styles.score}>
          <h1>Imperial Coin</h1>
          </div>
          <hr></hr>
          <div className={styles.score}>
            <img src={moneySvg} alt="money" className={styles.scoreImg} />
            <h1>{coinCount}</h1>
          </div>
          <img src={buttonSvg} alt="Click to earn coins" className={styles.clickButton} onClick={handleButtonClick} />
          <div className="flex items-center justify-center">
                <img src={highVoltage} width={44} height={44} alt="High Voltage" />
                <div className="ml-2 text-left">
                  <span className="text-white text-2xl font-bold block">{energy}</span>
                  <span className="text-white text-large opacity-75">/ 1000</span>
                </div>
              </div>
        </div>
      );
    }

    if (currentView === 'leaderboard') {
      return <Leaderboard />;
    }

    return null;
  };

  return (
    <div className={styles.app}>
      {renderContent()}
      {selectedCountry && (
        <div className={styles.menu}>
          <Button ghost className={styles.btn} onClick={() => setCurrentView('coin')} shape="circle" icon={<UserOutlined className={styles.icon} />} />
          <Button ghost className={`${styles.btn} ${styles.invisible}`} onClick={handleLogout} shape="circle" icon={<LogoutOutlined className={styles.icon} />} />
          <Button ghost className={styles.btn} onClick={() => setCurrentView('leaderboard')} shape="circle" icon={<TrophyOutlined className={styles.icon} />} />
        </div>
      )}
    </div>
  );
}

export default App;
