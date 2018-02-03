#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h> 

void error(const char *msg) {
    perror(msg);
    exit(0);
}

void normalize(char * a, int n) {
    for (int i = 0 ; i < n ; ++i) {
        if (a[i] == '\n' || a[i] == 10) {
            a[i] = '\0';
            return;
        }
    }
}

char * concate_strings(char * str1, char * str2) {
    normalize(str1, strlen(str1));
    normalize(str2, strlen(str2));

    char * r = malloc(sizeof(char) * (strlen(str1) + strlen(str2) + 1));
    int i = 0;

    for (i = 0 ; i < strlen(str1); i += 1) {
        r[i] = str1[i];
    }

    for (int j = 0 ; j < strlen(str2) ; j += 1, i += 1) 
        r[i] = str2[j];

    r[i] = '\0';

    return r;
}   

void formalize(char * a) {
    for (int i = 0 ; i < strlen(a) ; ++i) {
        if (a[i] == ';')
            a[i] = '\n';
    }
}

int main(int argc, char *argv[])
{
    int sockfd, portno, n, pid;
    struct sockaddr_in serv_addr;
    struct hostent *server;

    char buffer[256];
    char buffer1[256];
    char buffer2[256];
    char space[2];
    space[0] = ' ';
    space[1] = '\0';

    if (argc < 3) {
       fprintf(stderr,"usage %s hostname port\n", argv[0]);
       exit(0);
    }
    portno = atoi(argv[2]);

    server = gethostbyname(argv[1]);
    if (server == NULL) {
        fprintf(stderr,"ERROR, no such host\n");
        exit(0);
    }

    bzero((char *) &serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    bcopy((char *) server->h_addr, (char *) &serv_addr.sin_addr.s_addr, server->h_length);
    serv_addr.sin_port = htons(portno);

    printf("--------------------------\n");
    printf("|  Calculator - Client   |\n");
    printf("--------------------------\n");

    while (1) {
        sockfd = socket(AF_INET, SOCK_STREAM, 0);
        if (sockfd < 0) 
            error("ERROR opening socket");

        if (connect(sockfd,(struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) 
            error("ERROR connecting");

        printf("* Enter 1st number : ");
        bzero(buffer1,256);
        fgets(buffer1,255,stdin);

        printf("* Enter 2nd number : ");
        bzero(buffer2,256);
        fgets(buffer2,255,stdin);

        char * tempBuffer = concate_strings(buffer1, concate_strings(space, buffer2));

        n = write(sockfd,tempBuffer,strlen(tempBuffer));
        free(tempBuffer);

        if (n < 0) 
             error("ERROR writing to socket");

        bzero(buffer,256);
        
        n = read(sockfd,buffer,255);
        if (n < 0) 
             error("ERROR reading from socket");
        
        formalize(buffer);
        printf("%s\n", buffer);

        close(sockfd);
        printf("--------------------------------------------\n");
    }

    return 0;
}
