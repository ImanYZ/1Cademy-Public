import Queue from "bull";

const redisConfig = {
  host: "localhost",
  port: 6379,
};

interface DispatchJobData {
  data: string;
}

const dispatchQueue = new Queue<DispatchJobData>("dispatchQueue", { redis: redisConfig });

export default dispatchQueue;
