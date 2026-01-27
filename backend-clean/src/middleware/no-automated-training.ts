export const noAutomatedTraining = (req: any, res: any, next: any) => {
  res.setHeader('X-Robots-Tag', 'noai, noimageai');
  res.setHeader('X-AI-Training', 'none');
  res.setHeader('X-Automated-Training', 'none');
  next();
};

export default noAutomatedTraining;
