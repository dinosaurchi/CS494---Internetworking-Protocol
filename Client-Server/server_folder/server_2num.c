/* A simple server in the internet domain using TCP
   The port number is passed as an argument */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h> 
#include <sys/socket.h>
#include <netinet/in.h>

void error(const char *msg) {
    perror(msg);
    exit(1);
}

char * integer10_to_string(int n) {
    if (n == 0) {
        char * temp = malloc(2);
        temp[0] = '0';
        temp[1] = '\0';
        return temp;
    }

    char * s = malloc(sizeof(char) * 20);
    int i = 0;
    int integerPos = 0;
    if (n < 0) {
        integerPos = 1;
        n *= -1;
        s[0] = '-';
        i += 1;
    }

    int remain = 0;
    while(n != 0) {
        remain = n % 10;
        n = n / 10;
        s[i] = remain + '0';
        i += 1;
    }
    s[i] = '\0';

    int j = i - 1; 
    i = integerPos;

    while (i < j) {
        char temp = s[i];
        s[i] = s[j];
        s[j] = temp;
        i += 1;
        j -= 1;
    }

  return s;
}

int isSpliter(char c) {
    if (c == ',' || 
        c == ' ' || 
        c == '.' || 
        c == ';' || 
        c == 10 || 
        c == '\n' || 
        c == '-' || 
        c == '\0')
        return 1;
    return 0;
}

int isNumber(char c) {
    if ('0' <= c && c <= '9')
        return 1;
    return 0;
}

int * getNumbers(char * buffer, int n, int * flag){
    flag[0] = 1;
    int i = 0;
    int * result = malloc(sizeof(int) * n);
    int t = 0;

    while (buffer[i] != 0 && i < strlen(buffer)) {
        while ((buffer[i] == ' ' || buffer[i] == '\n') && i < strlen(buffer) - 1) {
            i += 1;
        }

        if (i >= strlen(buffer) || buffer[i] == '\0') {
            break;
        }

        int j = 0;
        int temp = 0;

        if (isSpliter(buffer[i]) == 0 && isNumber(buffer[i]) == 0) {
            flag[0] = 0;
            return NULL;
        }

        while ((buffer[i] <= '9' && buffer[i] >= '0') && (i < strlen(buffer))) {
            temp += (buffer[i] - '0');
            temp *= 10;
            j += 1;
            i += 1;

            if (isSpliter(buffer[i]) == 0 && isNumber(buffer[i]) == 0) {
                flag[0] = 0;
                return NULL;
            }
        }

        if (temp > 0)
            temp /= 10;

        result[t] = temp;
        t += 1;

        i += 1;
    }
    return result;
}

int getSum (int * a, int n) {
    int sum = 0;
    for (int i = 0 ; i < n ; ++i)  {
        sum += a[i];
    }
    return sum;
}

int getSub (int * a, int n) {
    int sub = a[0];
    for (int i = 1 ; i < n ; ++i)  {
        sub -= a[i];
    }
    return sub;
}

int getMul (int * a, int n) {
    if (n < 1)
        return 0;
    int mul = 1;
    for (int i = 0 ; i < n ; ++i)  {
        mul *= a[i];
    }
    return mul;
}

int getDiv (int * a, int n, int * flag) {
    flag[0] = 1;
    int Div = a[0];
    for (int i = 1 ; i < n ; ++i)  {
        if (a[i] == 0) {
            flag[0] = 0;
            return -1;
        }

        Div /= a[i];
    }
    return Div;
}

int getMod (int * a, int n, int * flag) {
    flag[0] = 1;
    int Mod = a[0];
    for (int i = 1 ; i < n ; ++i)  {
        if (a[i] == 0) {
            flag[0] = 0;
            return -1;
        }
        Mod %= a[i];
    }
    return Mod;
}

char * concate_strings(char * str1, char * str2) {
    char * r = malloc(sizeof(char) * (strlen(str1) + strlen(str2) + 1));
    int i = 0;
    for (i = 0 ; i < strlen(str1) ; i += 1) 
        r[i] = str1[i];

    for (int j = 0 ; j < strlen(str2) ; j += 1, i += 1) 
        r[i] = str2[j];
    r[i] = '\0';

    return r;
}   

void calculating (int newsockfd) {
    printf("Waiting for client...\n");
    int n;
    char buffer[256];

    bzero(buffer,256);
    n = read(newsockfd,buffer,255);
    if (n < 0) 
        error("ERROR reading from socket");

        // Received
    printf("Received: %s\n",buffer);

    char * result;
    char * char_num;
    char * del;
    int temp;
    int * flag = malloc(sizeof(int));
    int * numbers = getNumbers(buffer, 2, flag);

    // The getNumbers function will let us know whether the received input is legal or not
    if (flag[0] == 0) {
        n = write(newsockfd,"ERROR: Only accept Integer numbers",256);
        if (n < 0) 
            error("ERROR writing to socket");
        else
            printf("The error was sent back to client\n");

        printf("--------------------------------------------\n");
        if (numbers != NULL)
            free(numbers);

        free(flag);

        return;
    }
        // Summation
    temp = getSum(numbers, 2);
    char_num = integer10_to_string(temp);
    result = concate_strings(" Sum = ", char_num);
    free(char_num);

        // Subtraction
    temp = getSub(numbers, 2);
    char_num = integer10_to_string(temp);
    del = result;
    result = concate_strings(result, concate_strings(" ; Sub = ",char_num));
    free(del);
    free(char_num);

        // Multiplication
    temp = getMul(numbers, 2);
    char_num = integer10_to_string(temp);
    del = result;
    result = concate_strings(result, concate_strings("; Mul = ",char_num));
    free(del);
    free(char_num);

        // Division (Integer part)
    temp = getDiv(numbers, 2, flag);
    if (flag[0] != 0) 
        char_num = integer10_to_string(temp);
    else 
        char_num = "Cannot Divide by zero";

    del = result;
    result = concate_strings(result, concate_strings(" ; Div = ",char_num));
    free(del);
    if (flag[0] != 0) 
        free(char_num);

        // Modulo (Remaining part)
    temp = getMod(numbers, 2, flag);
    if (flag[0] != 0) 
        char_num = integer10_to_string(temp);
    else 
        char_num = "Cannot Divide by zero";

    del = result;
    result = concate_strings(result, concate_strings(" ; Mod = ",char_num));
    free(del);
    if (flag[0] != 0) 
        free(char_num);

    n = write(newsockfd,result,256);
    if (n < 0) 
        error("ERROR writing to socket");
    else
        printf("The result was sent back to client\n");

    printf("--------------------------------------------\n");
    free(result);
    free(flag);
    free(numbers);
}

int main(int argc, char *argv[]) {
    int sockfd, newsockfd, portno, pid;
    socklen_t clilen;
    struct sockaddr_in serv_addr, cli_addr;

    if (argc < 2) {
        fprintf(stderr,"ERROR, no port provided\n");
        exit(1);
    }

    bzero((char *) &serv_addr, sizeof(serv_addr));
    portno = atoi(argv[1]);
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = INADDR_ANY;
    serv_addr.sin_port = htons(portno);

    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) 
        error("ERROR opening socket");

    if (bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr)) < 0) 
        error("ERROR on binding");

    listen(sockfd,5);
    clilen = sizeof(cli_addr);

    printf("--------------------------\n");
    printf("|  Calculator - Server   |\n");
    printf("--------------------------\n");

    while (1){
        newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen);
        if (newsockfd < 0) 
            error("ERROR on accept");

        pid = fork();

        if (pid < 0) 
            error("ERROR on fork");
        if (pid == 0) {
            // Child process 
            close(sockfd);
            calculating(newsockfd);
            exit(0);
        }
        else {
            // Parent process
            close(newsockfd);
        }
    }
    close(sockfd);
  
    return 0; 
}
