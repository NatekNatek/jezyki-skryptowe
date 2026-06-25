#!/usr/bin/env bash

SAVE_FILE=".tictactoe_save"

board=([1]=_ [2]=_ [3]=_ [4]=_ [5]=_ [6]=_ [7]=_ [8]=_ [9]=_)
current_player="X"

print_board() {
    echo ""
    echo " ${board[1]} | ${board[2]} | ${board[3]}"
    echo "---+---+---"
    echo " ${board[4]} | ${board[5]} | ${board[6]}"
    echo "---+---+---"
    echo " ${board[7]} | ${board[8]} | ${board[9]}"
    echo ""
}

check_winner() {
    local p=$1
    local wins=(
        "1 2 3" "4 5 6" "7 8 9"
        "1 4 7" "2 5 8" "3 6 9"
        "1 5 9" "3 5 7"
    )
    for combo in "${wins[@]}"; do
        read -r a b c <<< "$combo"
        if [[ ${board[$a]} == "$p" && ${board[$b]} == "$p" && ${board[$c]} == "$p" ]]; then
            return 0
        fi
    done
    return 1
}

check_draw() {
    for i in {1..9}; do
        [[ ${board[$i]} == "_" ]] && return 1
    done
    return 0
}

save_game() {
    {
        echo "player=$current_player"
        for i in {1..9}; do
            echo "cell$i=${board[$i]}"
        done
    } > "$SAVE_FILE"
    echo "Game saved. Exiting."
    exit 0
}

load_game() {
    while IFS='=' read -r key val; do
        case "$key" in
            player) current_player="$val" ;;
            cell*) board[${key#cell}]="$val" ;;
        esac
    done < "$SAVE_FILE"
    rm -f "$SAVE_FILE"
    echo "Game resumed."
}

echo "Tic-Tac-Toe"
echo "Positions: 1-9 (left-to-right, top-to-bottom) | 0: save and quit"

if [[ -f "$SAVE_FILE" ]]; then
    read -r -p "Saved game found. Resume? (y/n): " choice
    [[ $choice == "y" || $choice == "Y" ]] && load_game
fi

while true; do
    print_board
    read -r -p "Player $current_player, enter position (0 to save, 1-9): " pos

    if [[ $pos == "0" ]]; then
        save_game
    fi

    if ! [[ $pos =~ ^[1-9]$ ]]; then
        echo "Invalid input. Enter a number from 0 to 9."
        continue
    fi

    if [[ ${board[$pos]} != "_" ]]; then
        echo "Cell $pos is already taken. Choose another."
        continue
    fi

    board[$pos]=$current_player

    if check_winner "$current_player"; then
        print_board
        echo "Player $current_player wins!"
        rm -f "$SAVE_FILE"
        break
    fi

    if check_draw; then
        print_board
        echo "It's a draw!"
        rm -f "$SAVE_FILE"
        break
    fi

    current_player=$([[ $current_player == "X" ]] && echo "O" || echo "X")
done
