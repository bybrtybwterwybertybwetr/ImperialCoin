import { useState, useEffect } from 'react';
import { getAllUsers } from '../../Database/db';
import styles from './styles.module.scss';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<{ userid: string; country: string; coins: number }[]>([]);
  const [isFetched, setIsFetched] = useState<boolean>(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!isFetched) {
        const users = await getAllUsers();
        users.sort((a, b) => b.coins - a.coins); // Sort users by coins in descending order
        setLeaderboard(users);
        setIsFetched(true);
      }
    };

    fetchLeaderboard();
  }, [isFetched]);

  return (
    <div className={styles.leaderboard}>
    <div className={styles.score}>
      <h1>Imperial Coin</h1>
    </div>
    <hr></hr>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((user, index) => (
          <li key={user.userid}>
            {index + 1}. {user.userid} : {user.coins} coins
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
