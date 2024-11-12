import { defineStore } from 'pinia';

export const useFileStore = defineStore('fileStore', {
  state: () => ({
    subjectsSessions: {},
    videosMap: {},
    groupedVideos: {},
    groupBy: 'subject-session',
    selectedFileNames: [],
    qualityControlEnabled: false,
    qualityControlData: [],
  }),
  getters: {
    getAllUniqueFileNames(state) {
      const uniqueFileNames = new Set();
      Object.values(state.videosMap)
        .flat()
        .forEach(video => uniqueFileNames.add(video.fileName));
      return Array.from(uniqueFileNames).sort((a, b) => a.localeCompare(b));
    },
  },
  actions: {
    organizeFilesByStructure(files) {
      const subjectsSessions = {};
      const videosMap = {};

      files.forEach((file) => {
        const relativePath = file.webkitRelativePath;
        const pathParts = relativePath.split('/');

        if (pathParts.length >= 3) {
          const [subject, session, fileName] = pathParts.slice(-3);

          if (fileName.endsWith('.mp4') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
            if (!subjectsSessions[subject]) {
              subjectsSessions[subject] = [];
            }
            if (!subjectsSessions[subject].includes(session)) {
              subjectsSessions[subject].push(session);
            }

            const key = `${subject} / ${session}`;
            if (!videosMap[key]) {
              videosMap[key] = [];
            }

            videosMap[key].push({
              fileName,
              path: URL.createObjectURL(file),
              fullPath: relativePath,
            });
          }
        }
      });

      this.subjectsSessions = subjectsSessions;
      this.videosMap = videosMap;
    },

    getSortedSubjectsSessions() {
      return Object.keys(this.subjectsSessions)
        .sort()
        .map((subject) => ({
          subject,
          sessions: [...this.subjectsSessions[subject]].sort(),
        }));
    },

    updateGroupedVideos() {
      this.groupedVideos = {};
      const sortedSubjects = this.getSortedSubjectsSessions();
      
      sortedSubjects.forEach(({ subject, sessions }) => {
        if (this.groupBy === 'subject') {
          const selectedVideosForSubject = sessions.flatMap((session) =>
            this.videosMap[`${subject} / ${session}`]
              ?.filter((video) => this.selectedFileNames.includes(video.fileName))
              .map((video) => ({
                ...video,
                subject,
                session,
              })) || []
          );

          if (selectedVideosForSubject.length > 0) {
            this.groupedVideos[subject] = selectedVideosForSubject;
          }
        } else if (this.groupBy === 'subject-session') {
          sessions.forEach((session) => {
            const key = `${subject} / ${session}`;
            const selectedVideosForSession = this.videosMap[key]
              ?.filter((video) => this.selectedFileNames.includes(video.fileName))
              .map((video) => ({
                ...video,
                subject,
                session,
              })) || [];

            if (selectedVideosForSession.length > 0) {
              this.groupedVideos[key] = selectedVideosForSession;
            }
          });
        }
      });
    },

    handleVideoSelection(selectedFileNames) {
      this.selectedFileNames = selectedFileNames;
      this.updateGroupedVideos();
    },

    updateGroupBy(groupBy) {
      this.groupBy = groupBy;
      this.updateGroupedVideos();
    },

  },
});